import { Document, Types } from "mongoose";

export interface UserOptions extends Document {
  _id: Types.ObjectId;
  userName: string;
  email: string;
  fullName: string;
  passwordHash: string;
  avatar: string;
  coverImage: string;
  bio: string;
  refreshToken: string;
  checkPassword(password: string): Promise<boolean>;
}
