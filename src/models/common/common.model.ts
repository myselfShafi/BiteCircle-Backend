import { Schema } from "mongoose";
import { MediaOptions } from "../../config/types";

export const MediaSchema: Schema<MediaOptions> = new Schema(
  {
    url: {
      type: Schema.Types.String,
      required: [true, "media cloudinary url is required!"],
    },
    publicId: {
      type: Schema.Types.String,
      required: [true, "media cloudinary id is required!"],
    },
  },
  { _id: false } // separate id not required
);
