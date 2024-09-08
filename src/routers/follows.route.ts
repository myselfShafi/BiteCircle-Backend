import { Router } from "express";
import {
  getFollowingChannels,
  toggleFollowing,
} from "../controllers/follows.controller";
import VerifyUserCookies from "../middlewares/auth.middleware";

const followRouter = Router();

followRouter.use(VerifyUserCookies);

followRouter
  .route("/channel-follow/:channelId")
  .get(getFollowingChannels)
  .post(toggleFollowing);

export default followRouter;
