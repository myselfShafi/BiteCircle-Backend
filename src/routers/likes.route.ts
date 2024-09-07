import { Router } from "express";
import { togglePostLike } from "../controllers/likes.controller";
import VerifyUserCookies from "../middlewares/auth.middleware";

const LikeRouter = Router();

LikeRouter.use(VerifyUserCookies);

LikeRouter.route("/toggle-postLike/:postId").post(togglePostLike);

export default LikeRouter;
