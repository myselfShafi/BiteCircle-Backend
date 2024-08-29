import { Response } from "express";
import { UploadMediaToCloudinary } from "../config/cloudinary";
import { UserOptions } from "../config/types";
import { UserModel } from "../models/users.model";
import ApiError from "../utils/helpers/ApiError";
import ApiResponse from "../utils/helpers/ApiResponse";
import AsyncWrapper from "../utils/helpers/AsyncWrapper";

interface FileRequest {
  body: UserOptions;
  files: { avatar: { path: string }[]; coverImage: { path: string }[] };
}

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
    .json(new ApiResponse(200, "User registered Successfully", getUser));
});

export { SignupUser };
