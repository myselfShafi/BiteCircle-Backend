import { Router } from "express";
import { sendEmailVerifyMail, verifyOtp } from "../controllers/otp.controller";

const OtpRouter = Router();

OtpRouter.route("/send-emailOtp").post(sendEmailVerifyMail);

OtpRouter.route("/verify-otp").post(verifyOtp);

export default OtpRouter;
