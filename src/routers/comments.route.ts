import { Router } from "express";
import {
  createComment,
  deleteComment,
  getAllComments,
} from "../controllers/comments.controller";
import VerifyUserCookies from "../middlewares/auth.middleware";

const commentRouter = Router();

commentRouter.use(VerifyUserCookies);

commentRouter
  .route("/posts-comment/:postId")
  .get(getAllComments)
  .post(createComment);

commentRouter.route("/delete-comment/:commentId").post(deleteComment);

export default commentRouter;
