import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  DeleteMediaFromCloudinary,
  UploadMediaToCloudinary,
} from "../config/cloudinary";
import { UserOptions } from "../config/types";
import { decodedTokenOptions } from "../middlewares/auth.middleware";
import { UserModel } from "../models/users.model";
import ApiError from "../utils/helpers/ApiError";
import ApiResponse from "../utils/helpers/ApiResponse";
import AsyncWrapper from "../utils/helpers/AsyncWrapper";
import { GenerateAccessAndRefreshTokens } from "../utils/tokens";
import { sendEmailVerifyMail } from "./otp.controller";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const SignupUser = AsyncWrapper(async (req: Request, res: Response) => {
  const { email, fullName, passwordHash } = req.body;

  // validating - not empty
  if (
    [email, fullName, passwordHash].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  // checking if user already exists
  const isExistingUser = await UserModel.findOne({ email });
  if (isExistingUser) {
    throw new ApiError(409, "User with Email already exists!");
  }

  let createUser;

  // upload user to mongodb
  try {
    createUser = await UserModel.create({
      email,
      fullName,
      passwordHash,
    });
  } catch (error) {
    console.log("Cannot register user .. ", error);
  }
  if (!createUser) {
    throw new ApiError(500, "Cannot register user! Try again.");
  }

  await sendEmailVerifyMail(fullName, email, "VERIFY-EMAIL");

  const getUser = await UserModel.findById(createUser._id).select(
    "-passwordHash"
  );
  if (!getUser) {
    throw new ApiError(500, "User not found! Try again.");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, "User registered Successfully ..", getUser));
});

const SigninUser = AsyncWrapper(async (req: Request, res: Response) => {
  const { email, passwordHash }: UserOptions = req.body;

  //check for creds
  if (!(email || passwordHash)) {
    throw new ApiError(400, "Email and Password are required!");
  }

  // validate if user exists
  const isExistingUser = await UserModel.findOne({ email });
  if (!isExistingUser) {
    throw new ApiError(404, "User does not exist");
  }

  // decode password
  const doesPasswordMatch = await isExistingUser.checkPassword(passwordHash);
  if (!doesPasswordMatch) {
    throw new ApiError(401, "Invalid password!");
  }

  // generate access/refresh tokens
  const { accessToken, refreshToken } = await GenerateAccessAndRefreshTokens(
    isExistingUser._id
  );

  const getUser = await UserModel.findById(isExistingUser._id).select(
    "-passwordHash -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, "User loggedin successfully ..", {
        user: getUser,
        accessToken, // for mobile apps cookies aren't there, so passing as data as well
        refreshToken,
      })
    );
});

const LogoutUser = AsyncWrapper(async (req: Request, res: Response) => {
  await UserModel.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1, // 1 means it removes the field from document as we passed it in unset clause
      },
    },
    {
      new: true, // this returns the updated doc rather than older doc before update
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "User logged out successfully ..", {}));
});

const UpdateUser = AsyncWrapper(async (req: Request, res: Response) => {
  const { userName, fullName, bio }: UserOptions = req.body;
  let updateFields: Partial<UserOptions> = {};

  const getUserToUpdate = await UserModel.findById(req.user?._id);

  if (!getUserToUpdate) {
    throw new ApiError(404, "User not found!");
  }

  // if username modification limit reached
  if (getUserToUpdate?.isUsernameModified) {
    throw new ApiError(400, "Username already modified, cannot change again!");
  }

  // if user tries to send empty field
  if ([userName, fullName].some((field) => !field || field?.trim() === "")) {
    throw new ApiError(400, "All fields are required!");
  }

  if (userName) {
    updateFields.userName = userName;
    updateFields.isUsernameModified = true;
  }
  if (fullName) updateFields.fullName = fullName;
  if (bio) updateFields.bio = bio;

  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updateFields,
    },
    {
      new: true,
    }
  ).select("-passwordHash");

  return res.status(200).json(
    new ApiResponse(200, "User Updated successfully ..", {
      user: updatedUser,
    })
  );
});

const UpdateAvatar = AsyncWrapper(async (req: Request, res: Response) => {
  const avatarPath = req.file?.path;

  if (!avatarPath) {
    const previousUser = await UserModel.findById(req.user?._id).select(
      "-passwordHash"
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "No changes made to avatar. Displaying existing one.",
        {
          user: previousUser, // Return previous user with existing avatar
        }
      )
    );
  }

  const updateAvatar = await UploadMediaToCloudinary(avatarPath);

  // update database with new avatar data
  const getUserToUpdate = await UserModel.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: updateAvatar,
      },
    },
    {
      new: true,
    }
  ).select("-passwordHash");

  // remove previous avatar
  if (updateAvatar && req.user?.avatar) {
    await DeleteMediaFromCloudinary(req.user?.avatar.publicId);
  }

  return res.status(200).json(
    new ApiResponse(200, "User Avatar Updated successfully ..", {
      user: getUserToUpdate,
    })
  );
});

const UpdateCoverImage = AsyncWrapper(async (req: Request, res: Response) => {
  const coverImagePath = req.file?.path;

  if (!coverImagePath) {
    const previousUser = await UserModel.findById(req.user?._id).select(
      "-passwordHash"
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "No changes made to avatar. Displaying existing one.",
        {
          user: previousUser, // Return previous user with existing avatar
        }
      )
    );
  }

  const updateCoverImage = await UploadMediaToCloudinary(coverImagePath);

  // update database with new avatar data
  const getUserToUpdate = await UserModel.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: updateCoverImage,
      },
    },
    {
      new: true,
    }
  ).select("-passwordHash");

  // remove previous avatar
  if (updateCoverImage && req.user?.coverImage) {
    await DeleteMediaFromCloudinary(req.user?.coverImage.publicId);
  }

  return res.status(200).json(
    new ApiResponse(200, "User CoverImage Updated successfully ..", {
      user: getUserToUpdate,
    })
  );
});

const regenerateAccessToken = AsyncWrapper(
  async (req: Request, res: Response) => {
    let secret = process.env.REFRESH_TOKEN_SECRET;
    const clientSavedRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!(clientSavedRefreshToken && secret)) {
      throw new ApiError(401, "Unauthorized Request!");
    }

    const decodedRefreshToken = jwt.verify(
      clientSavedRefreshToken,
      secret
    ) as decodedTokenOptions;

    const getUser = await UserModel.findById(decodedRefreshToken?._id);

    if (!getUser) {
      throw new ApiError(401, "Invalid Refresh token!");
    }

    if (clientSavedRefreshToken !== getUser.refreshToken) {
      throw new ApiError(401, "Expired Refresh token!");
    }

    const { accessToken, refreshToken } = await GenerateAccessAndRefreshTokens(
      getUser._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(200, "User authenticated successfully ..", {
          accessToken, // for mobile apps cookies aren't there, so passing as data as well
          refreshToken,
        })
      );
  }
);

const getCurrentUser = AsyncWrapper(async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.user?._id).select(
    "-passwordHash -refreshToken"
  );

  if (!user) {
    throw new ApiError(500, "User does not exist!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully ..", user));
});

const resetUserPassword = AsyncWrapper(async (req: Request, res: Response) => {
  const { newPassword }: { newPassword: string } = req.body;
  if (!newPassword) {
    throw new ApiError(401, "New Password is required!");
  }

  const getExistingUser = await UserModel.findById(req.user?._id);
  const isSameOldPassword = await getExistingUser?.checkPassword(newPassword);
  if (isSameOldPassword) {
    throw new ApiError(404, "New Password can't be same as old password!");
  }

  const updatePassword = await UserModel.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        passwordHash: newPassword,
      },
    },
    { new: true }
  );
  if (!updatePassword) {
    throw new ApiError(500, "Cannot update password!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Password reset successful!", {}));
});

export {
  getCurrentUser,
  LogoutUser,
  regenerateAccessToken,
  resetUserPassword,
  SigninUser,
  SignupUser,
  UpdateAvatar,
  UpdateCoverImage,
  UpdateUser,
};
