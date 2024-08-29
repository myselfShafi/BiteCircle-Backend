import { Request, Response } from "express";
import { UploadMediaToCloudinary } from "../config/cloudinary";
import { UserOptions } from "../config/types";
import { UserModel } from "../models/users.model";
import ApiError from "../utils/helpers/ApiError";
import ApiResponse from "../utils/helpers/ApiResponse";
import AsyncWrapper from "../utils/helpers/AsyncWrapper";
import { GenerateAccessAndRefreshTokens } from "../utils/tokens";

interface FileRequest {
  body: UserOptions;
  files: { avatar: { path: string }[]; coverImage: { path: string }[] };
}

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const SignupUser = AsyncWrapper(async (req: FileRequest, res: Response) => {
  const { userName, email, fullName, passwordHash, bio } = req.body;

  // validating - not empty
  if (
    [userName, email, fullName, passwordHash].some(
      (list) => list?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  // checking if user already exists
  const isExistingUser = await UserModel.findOne({
    $or: [{ userName }, { email }],
  });

  if (isExistingUser) {
    throw new ApiError(409, "Username or Email already registered!");
  }

  // check for avatar, optional - display upload screen for new user registers

  const avatarPath = req.files?.avatar?.[0]?.path;
  const coverImagePath = req.files?.coverImage?.[0]?.path;

  let avatarURL, coverImageURL;

  if (avatarPath) {
    avatarURL = await UploadMediaToCloudinary(avatarPath);
  }
  if (coverImagePath) {
    coverImageURL = await UploadMediaToCloudinary(coverImagePath);
  }

  // upload user to mongodb
  const createUser = await UserModel.create({
    userName,
    email,
    fullName,
    passwordHash,
    avatar: avatarURL,
    coverImage: coverImageURL,
    bio,
  });

  if (!createUser) {
    throw new ApiError(500, "Cannot register user! Try again.");
  }

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
  const { user } = req.body as { user: UserOptions };

  await UserModel.findByIdAndUpdate(
    user._id,
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

export { LogoutUser, SigninUser, SignupUser };
