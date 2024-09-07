import { Router } from "express";
import {
  createPost,
  deletePost,
  editPost,
  fetchPost,
  fetchUserAllPosts,
} from "../controllers/posts.controller";
import VerifyUserCookies from "../middlewares/auth.middleware";
import handleUpload from "../middlewares/multer";

const postRouter = Router();

postRouter.use(VerifyUserCookies);

postRouter
  .route("/create-post")
  .post(handleUpload.array("postMedia", 10), createPost); //max of 10 allowed/post

postRouter
  .route("/get-post/:postId")
  .get(fetchPost)
  .put(handleUpload.array("postMedia", 10), editPost)
  .delete(deletePost);

postRouter.route("/get-user-all-posts/:userId").get(fetchUserAllPosts);

export default postRouter;
