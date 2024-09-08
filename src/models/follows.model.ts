import { model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { FollowOptions } from "../config/types";
import ApiError from "../utils/helpers/ApiError";
import { UserModel } from "./users.model";

const followSchema: Schema<FollowOptions> = new Schema(
  {
    followerId: {
      type: Schema.Types.ObjectId, //one who is following
      ref: "User",
    },
    followingId: {
      type: Schema.Types.ObjectId, //acc which is followed
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

followSchema.pre("save", async function (next) {
  // pre check if user exists in db
  const existingChannel = await UserModel.findOne({ _id: this.followerId });
  if (!existingChannel) {
    throw new ApiError(404, "Channel does not exist!");
  }
  next();
});

followSchema.plugin(mongooseAggregatePaginate);

export const FollowModel = model<FollowOptions>("Follow", followSchema);
