import { Request, Response } from "express";
import {
  emailVerificationContent,
  emailVerificationSubject,
} from "../config/content";
import { OtpModel } from "../models/otp.model";
import ApiError from "../utils/helpers/ApiError";
import ApiResponse from "../utils/helpers/ApiResponse";
import AsyncWrapper from "../utils/helpers/AsyncWrapper";
import handleMailSend from "../utils/mailSend";

let otp = Math.floor(1000 + Math.random() * 9000).toString();

const sendEmailVerifyMail = AsyncWrapper(
  async (req: Request, res: Response) => {
    const { email }: { email: string } = req.body;
    if (!email || !email.includes("@")) {
      throw new ApiError(401, "Please enter correct Email!");
    }
    await OtpModel.deleteMany({ email }); // to avoid multiple otps to same email

    const storeOtp = await OtpModel.create({
      otp,
      email,
    });
    if (!storeOtp) {
      throw new ApiError(500, "Failed to store OTP in db!");
    }

    const sendMail = await handleMailSend(
      email,
      emailVerificationSubject,
      emailVerificationContent(otp)
    );
    if (sendMail.accepted.length === 0) {
      throw new ApiError(504, "Failed to send mail!");
    }

    return res.status(201).json(
      new ApiResponse(201, "Otp Sent Successfully!", {
        email: sendMail.accepted[0],
      })
    );
  }
);

const verifyOtp = AsyncWrapper(async (req: Request, res: Response) => {
  const { clientOtp, email }: { clientOtp: string; email: string } = req.body;
  if (!email || !email.includes("@") || !clientOtp) {
    throw new ApiError(401, "Email or Otp invalid format!");
  }

  const getDbOtp = await OtpModel.findOne({ email });
  if (!getDbOtp) {
    throw new ApiError(404, "Otp has expired!");
  }

  const doesOtpMatch = clientOtp?.trim() === getDbOtp.otp;
  if (!doesOtpMatch) {
    throw new ApiError(400, "Otp is Invalid!");
  }

  await OtpModel.deleteMany({ email });

  return res
    .status(201)
    .json(new ApiResponse(201, "Otp verified Successfully!", { email }));
});

export { sendEmailVerifyMail, verifyOtp };
