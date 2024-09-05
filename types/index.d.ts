import type { UserOptions } from "../src/config/types";

interface FileUpload {
  avatar?: { path: string }[];
  coverImage?: { path: string }[];
}

declare global {
  namespace Express {
    interface Request {
      files?: FileUpload;
      user?: UserOptions;
    }
  }
}
