import { model, Schema } from "mongoose";
import { OtpOptions } from "../config/types";

const otpSchema: Schema<OtpOptions> = new Schema(
  {
    otp: {
      type: Schema.Types.String,
      required: [true, "Otp is required!"],
      trim: true,
    },
    email: {
      type: Schema.Types.String,
      lowercase: true,
      trim: true,
      required: [true, "Verification Email is required!"],
    },
  },
  { timestamps: true, expireAfterSeconds: 600 }
);

export const OtpModel = model<OtpOptions>("Otp", otpSchema);
