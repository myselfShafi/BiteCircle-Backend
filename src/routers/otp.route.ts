import { Router } from "express";
import {
  sendOtpMail,
  verifyNewEmail,
  verifyPass,
} from "../controllers/otp.controller";

const OtpRouter = Router();

OtpRouter.route("/send-emailOtp").post(sendOtpMail);

OtpRouter.route("/verify-emailOtp").post(verifyNewEmail);
OtpRouter.route("/verify-pwdOtp").post(verifyPass);

export default OtpRouter;
