import { model, Schema } from "mongoose";
import { LikeOptions } from "../config/types";

const likeSchema: Schema<LikeOptions> = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export const LikeModel = model<LikeOptions>("Like", likeSchema);
