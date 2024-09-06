import { model, Schema } from "mongoose";
import { PostOptions } from "../config/types";
import { MediaSchema } from "./common/common.model";

const PostSchema: Schema<PostOptions> = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    media: {
      type: [MediaSchema],
      required: [true, "Post Content is required!"],
    },
    caption: {
      type: Schema.Types.String,
      required: [true, "Caption is required!"],
      maxlength: [2000, "Max. character length reached!"],
    },
  },
  { timestamps: true }
);

export const PostModel = model<PostOptions>("Post", PostSchema);
