import { model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { CommentOptions } from "../config/types";

const commentSchema: Schema<CommentOptions> = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: Schema.Types.String,
      required: [true, "Comment is required!"],
    },
  },
  { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const CommentModel = model<CommentOptions>("Comment", commentSchema);
