import { Request, Response } from "express";
import pLimit from "p-limit"; //using v3.1.0 due to ESM conflicts
import { UploadMediaToCloudinary } from "../config/cloudinary";
import { LocalFileType, PostOptions } from "../config/types";
import { PostModel } from "../models/posts.model";
import ApiError from "../utils/helpers/ApiError";
import ApiResponse from "../utils/helpers/ApiResponse";
import AsyncWrapper from "../utils/helpers/AsyncWrapper";

const limit = pLimit(10);

const createPost = AsyncWrapper(async (req: Request, res: Response) => {
  const { caption }: PostOptions = req.body;

  if (req.files?.length === 0 || !caption) {
    throw new ApiError(400, "Content or Caption is missing!");
  }

  const allMediaPaths =
    Array.isArray(req.files) &&
    req.files?.map((list: LocalFileType) => list.path);

  const uploadAllFiles = Array.isArray(allMediaPaths)
    ? allMediaPaths.map((path: string) => {
        return limit(async () => {
          return await UploadMediaToCloudinary(path);
        });
      })
    : [];

  let uploads = await Promise.all(uploadAllFiles);

  if (uploads.length === 0) {
    throw new ApiError(500, "Failed to upload post content!");
  }

  const addNewPost = await PostModel.create({
    owner: req.user?._id,
    media: uploads,
    caption,
  }).then((data) => data);

  if (!addNewPost) {
    throw new ApiError(500, "Failed to save post!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Post created successfully ..", { post: addNewPost })
    );
});

export { createPost };
