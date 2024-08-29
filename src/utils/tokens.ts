import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { UserModel } from "../models/users.model";
import ApiError from "./helpers/ApiError";

const CreateAccessToken = async (payload: object) => {
  try {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiry = process.env.ACCESS_TOKEN_EXPIRY;

    if (!secret) {
      throw new ApiError(500, "Token error ..");
    }

    return jwt.sign(payload, secret, {
      expiresIn: expiry,
    });
  } catch (error) {
    throw new ApiError(500, "Access Token error .." + error);
  }
};

const CreateRefreshToken = async (payload: object) => {
  try {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const expiry = process.env.REFRESH_TOKEN_EXPIRY;

    if (!secret) {
      throw new ApiError(500, "Token error ..");
    }
    return jwt.sign(payload, secret, {
      expiresIn: expiry,
    });
  } catch (error) {
    throw new ApiError(500, "Refresh Token error .." + error);
  }
};

const GenerateAccessAndRefreshTokens = async (userId: Types.ObjectId) => {
  try {
    const user = await UserModel.findById(userId).select(
      "_id userName email fullName"
    );

    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const userPlainObject = user.toObject(); // convert Mongoose document to plain object for jwt to accept

    const accessToken = await CreateAccessToken(userPlainObject);
    const refreshToken = await CreateRefreshToken(userPlainObject);

    if (user && refreshToken) {
      user.refreshToken = refreshToken;
      await user?.save({ validateBeforeSave: false }); // to ensure mongoose data is valid and not autorun validation
    }
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Cannot generate Referesh & Access token" + error);
  }
};

export { GenerateAccessAndRefreshTokens };
