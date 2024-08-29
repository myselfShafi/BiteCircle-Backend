import { Router } from "express";
import {
  LogoutUser,
  SigninUser,
  SignupUser,
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

export default userRouter;
