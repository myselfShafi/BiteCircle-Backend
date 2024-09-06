import { Router } from "express";
import { createPost } from "../controllers/posts.controller";
import VerifyUserCookies from "../middlewares/auth.middleware";
import handleUpload from "../middlewares/multer";

const postRouter = Router();

postRouter.use(VerifyUserCookies);

postRouter
  .route("/create-post")
  .post(handleUpload.array("postMedia", 10), createPost); //max of 10 allowed/post

export default postRouter;
