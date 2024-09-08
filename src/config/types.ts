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

export interface PostOptions extends Document {
  _id: Types.ObjectId;
  owner: UserOptions;
  media: MediaOptions[];
  caption: string;
}

export interface CommentOptions extends Document {
  _id: Types.ObjectId;
  postId: PostOptions;
  ownerId: UserOptions;
  content: string;
}

export interface LikeOptions extends Document {
  _id: Types.ObjectId;
  postId: PostOptions;
  ownerId: UserOptions;
}

export interface FollowOptions extends Document {
  _id: Types.ObjectId;
  followerId: UserOptions;
  followingId: UserOptions;
}
export interface LocalFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}
