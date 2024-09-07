import { Request, Response } from "express";
import pLimit from "p-limit"; //using v3.1.0 due to ESM conflicts
import {
  DeleteMediaFromCloudinary,
  UploadMediaToCloudinary,
} from "../config/cloudinary";
import { LocalFileType, MediaOptions, PostOptions } from "../config/types";
import { PostModel } from "../models/posts.model";
import ApiError from "../utils/helpers/ApiError";
import ApiResponse from "../utils/helpers/ApiResponse";
import AsyncWrapper from "../utils/helpers/AsyncWrapper";

const limit = pLimit(10);

const concurrentlyUploadMediaToCloudinary = async (files: LocalFileType[]) => {
  try {
    const allMediaPaths = files?.map((list: LocalFileType) => list.path);

    const uploadAllFiles = allMediaPaths.map((path: string) => {
      return limit(async () => {
        return await UploadMediaToCloudinary(path);
      });
    });

    return await Promise.all(uploadAllFiles);
  } catch (error) {
    throw new ApiError(500, "Failed to bulk-save media to cloudinary!" + error);
  }
};

const concurrentlyDeleteMediaFromCloudinary = async (publicIds: string[]) => {
  try {
    const RemoveAllFiles = publicIds.map((id: string) => {
      return limit(async () => {
        return await DeleteMediaFromCloudinary(id);
      });
    });
    return await Promise.all(RemoveAllFiles);
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to bulk-delete media from cloudinary!" + error
    );
  }
};

const createPost = AsyncWrapper(async (req: Request, res: Response) => {
  const { caption }: PostOptions = req.body;

  if (req.files?.length === 0 || !caption) {
    throw new ApiError(400, "Content or Caption is missing!");
  }

  const uploads =
    Array.isArray(req.files) &&
    (await concurrentlyUploadMediaToCloudinary(req.files));

  const addNewPost = await PostModel.create({
    owner: req.user?._id,
    media: uploads,
    caption,
  }).then((data) => data);

  if (!addNewPost) {
    throw new ApiError(500, "Failed to save post!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Post created successfully ..", addNewPost));
});

const fetchUserAllPosts = AsyncWrapper(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "user ID not provided!");
  }

  const getUserPosts = await PostModel.find({ owner: userId });

  if (!getUserPosts) {
    throw new ApiError(400, "Failed to fetch User's posts!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "fetched all posts successfully ..", getUserPosts)
    );
});

const editPost = AsyncWrapper(async (req: Request, res: Response) => {
  const {
    caption,
    deletedMediaId,
  }: { caption: string; deletedMediaId: string[] } = req.body;
  const { postId } = req.params;

  if (!caption) {
    throw new ApiError(400, "Caption is missing!");
  }

  const deleteFromCloudinary =
    await concurrentlyDeleteMediaFromCloudinary(deletedMediaId);

  if (deleteFromCloudinary) {
    await PostModel.findByIdAndUpdate(postId, {
      $pull: {
        media: {
          publicId: { $in: deletedMediaId },
        },
      },
    });
  }

  const uploads =
    Array.isArray(req.files) &&
    (await concurrentlyUploadMediaToCloudinary(req.files));

  const UpdatedPost = await PostModel.findByIdAndUpdate(
    postId,
    {
      $set: {
        caption,
      },
      $push: {
        media: {
          $each: uploads,
        },
      },
    },
    { new: true }
  );

  if (!UpdatedPost) {
    throw new ApiError(500, "Failed to update the post!");
  }

  return res.status(200).json(
    new ApiResponse(200, "Updated post successfully ..", {
      post: UpdatedPost,
    })
  );
});

const deletePost = AsyncWrapper(async (req: Request, res: Response) => {
  const { postId } = req.params;

  if (!postId) {
    throw new ApiError(500, "Failed to delete post!");
  }

  const allMediaPublicIds = await PostModel.findById(postId).then((data) =>
    data?.media.map((media: MediaOptions) => media.publicId)
  );

  if (!allMediaPublicIds) {
    throw new ApiError(500, "Cannot get Post's media IDs!");
  }

  await concurrentlyDeleteMediaFromCloudinary(allMediaPublicIds);

  const deletePost = await PostModel.findByIdAndDelete(postId);

  if (!deletePost) {
    throw new ApiError(500, "Failed to delete post!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Post deleted successfully ..", {}));
});

export { createPost, deletePost, editPost, fetchUserAllPosts };
