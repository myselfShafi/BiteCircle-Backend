import { Response } from "express";
import { FileRequest, UserOptions } from "../config/types";
import { UserModel } from "../models/users.model";
import ApiError from "../utils/helpers/ApiError";
import ApiResponse from "../utils/helpers/ApiResponse";
import AsyncWrapper from "../utils/helpers/AsyncWrapper";

const SignupUser = AsyncWrapper(async (req: FileRequest, res: Response) => {
  const { userName, email, fullName, passwordHash, bio }: UserOptions =
    req.body;

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
  let avatarPath;
  let coverImagePath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarPath = req.files.avatar[0].path;
  }
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagePath = req.files.coverImage[0].path;
  }

  if (avatarPath) {
    // handle cloudinary upload, else display dummy avatar
    console.log({ avatarPath });
  }

  if (coverImagePath) {
    // handle cloudinary upload
    console.log({ coverImagePath });
  }

  // upload user to mongodb
  const createUser = await UserModel.create({
    userName,
    email,
    fullName,
    passwordHash,
    avatar: "cloudinary_dummyimage_url_string",
    coverImage: "cloudinary_dummyimage_url_string",
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
