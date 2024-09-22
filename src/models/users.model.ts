import bcrypt from "bcrypt";
import { model, Schema } from "mongoose";
import { UserOptions } from "../config/types";
import { MediaSchema } from "./common/common.model";

const userSchema: Schema<UserOptions> = new Schema(
  {
    userName: {
      type: Schema.Types.String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    isUsernameModified: {
      // allow username change only once
      type: Schema.Types.Boolean,
      default: false,
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
    isVerifiedEmail: {
      type: Schema.Types.Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("passwordHash")) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
    if (this.isNew) {
      let baseName = this.fullName.toLowerCase().replace(/\s+/g, "_"); // replacing space with underscores
      let matchingUserName = await UserModel.find({
        userName: { $regex: baseName },
      });

      if (matchingUserName.length === 0) {
        this.userName = baseName;
      } else {
        let newUserName = baseName;
        // using set [O(1)] instead of just map[o(n)] for time complexity, faster search result
        const existingUserNames = new Set(
          matchingUserName.map((user) => user.userName)
        );
        let count = 1;
        while (existingUserNames.has(newUserName)) {
          count++;
          newUserName = `${baseName}${count}`;
        }
        this.userName = newUserName;
      }
    }
    next();
  } catch (error) {
    console.log("User Pre-hook error ..", error);
  }
});

userSchema.methods.checkPassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.passwordHash);
};

export const UserModel = model<UserOptions>("User", userSchema);
