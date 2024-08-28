import { Request } from "express";

export interface UserOptions {
  userName: string;
  email: string;
  fullName: string;
  passwordHash: string;
  avatar: string;
  coverImage: string;
  bio: string;
}

export interface FileRequest extends Request {
  files?: { [fieldname: string]: Express.Multer.File[] };
}
