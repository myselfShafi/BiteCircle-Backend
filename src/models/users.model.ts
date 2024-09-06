import bcrypt from "bcrypt";
import { model, Schema } from "mongoose";
import { UserOptions } from "../config/types";
import { MediaSchema } from "./common/common.model";

const userSchema: Schema<UserOptions> = new Schema(
  {
    userName: {
      type: Schema.Types.String,
      required: [true, "Username is required!"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: Schema.Types.String,
      required: [true, "Email is required!"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: Schema.Types.String,
      required: [true, "Name is required!"],
      trim: true,
      index: true,
    },
    passwordHash: {
      type: Schema.Types.String,
      required: [true, "Password is required!"],
    },
    avatar: {
      type: MediaSchema,
    },
    coverImage: {
      type: MediaSchema,
    },
    bio: {
      type: Schema.Types.String,
    },
    refreshToken: {
      type: Schema.Types.String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("passwordHash")) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  if (this.isModified("userName")) {
    this.userName = this.userName.replace(/\s+/g, "_"); // replacing space with underscores
  }
  next();
});

userSchema.methods.checkPassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.passwordHash);
};

export const UserModel = model<UserOptions>("User", userSchema);
