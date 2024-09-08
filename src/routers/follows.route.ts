import { Router } from "express";
import {
  getChannelFollowers,
  getFollowingChannels,
  toggleFollowing,
} from "../controllers/follows.controller";
import VerifyUserCookies from "../middlewares/auth.middleware";

const followRouter = Router();

followRouter.use(VerifyUserCookies);

followRouter
  .route("/channel-follow/:channelId")
  .get(getChannelFollowers)
  .post(toggleFollowing);

followRouter.route("/channel-follower/:followerUser").get(getFollowingChannels);

export default followRouter;
