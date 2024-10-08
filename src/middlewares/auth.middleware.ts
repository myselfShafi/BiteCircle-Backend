import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserModel } from "../models/users.model";
import ApiError from "../utils/helpers/ApiError";
import AsyncWrapper from "../utils/helpers/AsyncWrapper";

export interface decodedTokenOptions extends JwtPayload {
  _id: string;
  userName: string;
  email: string;
  fullName: string;
}

const VerifyUserCookies = AsyncWrapper(
  async (req: Request, _: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!(token && secret)) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, secret) as decodedTokenOptions; // handles if user is authenticated or not

    const getTokenAssignedUser = await UserModel.findById(
      decodedToken?._id
    ).select("-passwordHash -refreshToken");

    if (!getTokenAssignedUser) {
      throw new ApiError(404, "User with this token not found");
    }

    req.user = getTokenAssignedUser;
    next();
  }
);

export default VerifyUserCookies;
