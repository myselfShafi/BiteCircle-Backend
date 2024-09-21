import { Router } from "express";
import {
  getCurrentUser,
  LogoutUser,
  regenerateAccessToken,
  SigninUser,
  SignupUser,
  UpdateAvatar,
  UpdateCoverImage,
  UpdateUser,
} from "../controllers/users.controller";
import VerifyUserCookies from "../middlewares/auth.middleware";
import handleUpload from "../middlewares/multer";

const userRouter = Router();

userRouter.route("/signup").post(
  handleUpload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  SignupUser
);

userRouter.route("/login").post(SigninUser);
userRouter.route("/logout").post(VerifyUserCookies, LogoutUser);
userRouter.route("/update").post(VerifyUserCookies, UpdateUser);
userRouter
  .route("/edit-avatar")
  .post(VerifyUserCookies, handleUpload.single("avatar"), UpdateAvatar);
userRouter
  .route("/edit-coverImage")
  .post(VerifyUserCookies, handleUpload.single("coverImage"), UpdateCoverImage);
userRouter
  .route("/authenticate-user")
  .get(VerifyUserCookies, getCurrentUser)
  .post(regenerateAccessToken);

export default userRouter;
