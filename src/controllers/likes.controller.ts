import { Request, Response } from "express";
import { LikeModel } from "../models/likes.model";
import ApiError from "../utils/helpers/ApiError";
import ApiResponse from "../utils/helpers/ApiResponse";
import AsyncWrapper from "../utils/helpers/AsyncWrapper";

const togglePostLike = AsyncWrapper(async (req: Request, res: Response) => {
  const { postId } = req.params;
  if (!postId) {
    throw new ApiError(400, "Post Id unavailable!");
  }

  const alreadyLiked = await LikeModel.findOne({
    ownerId: req.user?._id,
    postId,
  });

  let togglePost;

  if (!alreadyLiked) {
    togglePost = await LikeModel.create({
      postId,
      ownerId: req.user?._id,
    });
  } else {
    await LikeModel.findByIdAndDelete(alreadyLiked._id);
    togglePost = {};
  }

  if (!togglePost) {
    throw new ApiError(500, "Cannot change post like status!");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Post like status updated successfully ..",
        togglePost
      )
    );
});

export { togglePostLike };
