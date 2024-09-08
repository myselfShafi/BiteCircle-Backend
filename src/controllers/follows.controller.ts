import { Request, Response } from "express";
import { Types } from "mongoose";
import { FollowModel } from "../models/follows.model";
import ApiError from "../utils/helpers/ApiError";
import ApiResponse from "../utils/helpers/ApiResponse";
import AsyncWrapper from "../utils/helpers/AsyncWrapper";

const toggleFollowing = AsyncWrapper(async (req: Request, res: Response) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "Channel Id unavailable!");
  }

  if (channelId.toString() === req.user?._id.toString()) {
    throw new ApiError(400, "Cannot follow own account!");
  }

  const alreadyFollowing = await FollowModel.findOne({
    followingId: channelId,
    followerId: req.user?._id,
  });

  let toggleFollowing;
  if (!alreadyFollowing) {
    toggleFollowing = await FollowModel.create({
      followingId: channelId,
      followerId: req.user?._id,
    });
  } else {
    await FollowModel.findByIdAndDelete(alreadyFollowing._id);
    toggleFollowing = {};
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "User following updated ..", toggleFollowing));
});

const getFollowingChannels = AsyncWrapper(
  async (req: Request, res: Response) => {
    const { channelId } = req.params;
    if (!channelId) {
      throw new ApiError(400, "Channel Id unavailable!");
    }

    const getChannels = await FollowModel.aggregate([
      { $match: { followingId: new Types.ObjectId(channelId) } },
      {
        $lookup: {
          from: "users", // collection name should match as per mongodb site, not schema
          localField: "followerId",
          foreignField: "_id",
          as: "follower",
        },
      },
      {
        $addFields: {
          fullName: { $arrayElemAt: ["$follower.fullName", 0] },
          avatar: { $arrayElemAt: ["$follower.avatar", 0] },
        },
      },
      {
        $project: {
          fullName: 1,
          avatar: 1,
        },
      },
    ]);
    if (!getChannels) {
      throw new ApiError(500, "Failed to get followings list!");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "fetched User followings..", getChannels));
  }
);

export { getFollowingChannels, toggleFollowing };
