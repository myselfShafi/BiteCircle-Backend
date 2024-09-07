import { model, Schema } from "mongoose";
import { CommentOptions, PostOptions } from "../config/types";
import { CommentModel } from "./comments.model";
import { MediaSchema } from "./common/common.model";

const postSchema: Schema<PostOptions> = new Schema(
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

postSchema.post("findOneAndDelete", async function (doc: CommentOptions) {
  if (doc) {
    await CommentModel.deleteMany({ postId: doc._id });
  }
});

export const PostModel = model<PostOptions>("Post", postSchema);
