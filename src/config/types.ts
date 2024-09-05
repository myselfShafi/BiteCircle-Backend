import { Document, Types } from "mongoose";

export interface MediaOptions {
  url: string;
  publicId: string;
}

export interface UserOptions extends Document {
  _id: Types.ObjectId;
  userName: string;
  email: string;
  fullName: string;
  passwordHash: string;
  avatar: MediaOptions;
  coverImage: MediaOptions;
  bio: string;
  refreshToken: string;
  checkPassword(password: string): Promise<boolean>;
}
