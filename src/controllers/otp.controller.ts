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

interface OtpVerifyProps {
  email: string;
  action: "VERIFY-EMAIL" | "PASS-RESET";
}

const sendEmailVerifyMail = async (
  email: OtpVerifyProps["email"],
  action: OtpVerifyProps["action"]
) => {
  try {
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

    const { subject, body } = (() => {
      switch (action) {
        case "VERIFY-EMAIL":
          return {
            subject: emailVerificationSubject,
            body: emailVerificationContent(otp),
          };
        case "PASS-RESET":
          return {
            subject: "Password Reset Otp Email",
            body: `<h1>${otp}</h1>.`,
          };
        default:
          throw new ApiError(504, "Invalid action specified!");
      }
    })();

    const sendMail = await handleMailSend(email, subject, body);
    if (sendMail.accepted.length === 0) {
      throw new ApiError(504, "Failed to send mail!");
    }

    return sendMail.accepted[0];
  } catch (error) {
    throw new ApiError(500, "Error sending Otp email .. " + error);
  }
};

const sendOtpMail = AsyncWrapper(async (req: Request, res: Response) => {
  const { email, action }: OtpVerifyProps = req.body;

  const getReceiverEmail = await sendEmailVerifyMail(email, action);

  return res.status(201).json(
    new ApiResponse(201, "Otp Sent Successfully!", {
      email: getReceiverEmail,
    })
  );
});

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

export { sendEmailVerifyMail, sendOtpMail, verifyOtp };
