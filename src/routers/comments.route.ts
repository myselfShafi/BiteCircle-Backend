import { Router } from "express";
import {
  createComment,
  deleteComment,
  editComment,
  getAllComments,
} from "../controllers/comments.controller";
import VerifyUserCookies from "../middlewares/auth.middleware";

const commentRouter = Router();

commentRouter.use(VerifyUserCookies);

commentRouter
  .route("/posts-comment/:postId")
  .get(getAllComments)
  .post(createComment);

commentRouter
  .route("/user-comment/:commentId")
  .delete(deleteComment)
  .patch(editComment);

export default commentRouter;
