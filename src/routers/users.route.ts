import { Router } from "express";
import { SigninUser, SignupUser } from "../controllers/users.controller";
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

export default userRouter;
