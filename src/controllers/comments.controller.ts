import { Request, Response } from "express";
import { Types } from "mongoose";
import { CommentOptions } from "../config/types";
import { CommentModel } from "../models/comments.model";
import ApiError from "../utils/helpers/ApiError";
import ApiResponse from "../utils/helpers/ApiResponse";
import AsyncWrapper from "../utils/helpers/AsyncWrapper";

const createComment = AsyncWrapper(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { content }: CommentOptions = req.body;

  if (!postId || !content) {
    throw new ApiError(400, "Comment or Post ID unavailable!");
  }

  const addComment = await CommentModel.create({
    postId,
    ownerId: req.user?._id,
    content,
  }).then((comment) => comment);

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment added successfully ..", addComment));
});

const getAllComments = AsyncWrapper(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  let parsedPage = parseInt(page as string);
  let parsedLimit = parseInt(limit as string);

  if (!postId) {
    throw new ApiError(400, "Post ID unavailable!");
  }

  const getComments = await CommentModel.aggregate([
    {
      $match: {
        postId: new Types.ObjectId(postId), // converting id to bson object- accepted by mongodb
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "ownerId",
        foreignField: "_id",
        as: "commenter",
      },
    },
    {
      $addFields: {
        fullName: { $arrayElemAt: ["$commenter.fullName", 0] },
        avatar: { $arrayElemAt: ["$commenter.avatar", 0] },
      },
    },
    {
      $project: {
        fullName: 1,
        avatar: 1,
        content: 1,
        timeStamps: 1,
      },
    },
    { $skip: (parsedPage - 1) * parsedLimit },
    { $limit: parsedLimit },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "fetched post comments successfully ..", getComments)
    );
});

const deleteComment = AsyncWrapper(async (req: Request, res: Response) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "comment Id is required!");
  }

  const isDeleted = await CommentModel.findByIdAndDelete(commentId);
  if (!isDeleted) {
    throw new ApiError(500, "Unable to delete the comment!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Comment deleted successfully ..", {}));
});

export { createComment, deleteComment, getAllComments };
