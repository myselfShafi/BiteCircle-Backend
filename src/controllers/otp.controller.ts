import { Request, Response } from "express";
import {
  emailVerificationContent,
  emailVerificationSubject,
  pwdResetContent,
  pwdResetSubject,
} from "../config/content";
import { OtpModel } from "../models/otp.model";
import { UserModel } from "../models/users.model";
import ApiError from "../utils/helpers/ApiError";
import ApiResponse from "../utils/helpers/ApiResponse";
import AsyncWrapper from "../utils/helpers/AsyncWrapper";
import handleMailSend from "../utils/mailSend";
import { GenerateAccessAndRefreshTokens } from "../utils/tokens";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

interface OtpVerifyProps {
  fullName: string;
  email: string;
  action: "VERIFY-EMAIL" | "PASS-RESET";
}

const sendEmailVerifyMail = async (
  fullName: OtpVerifyProps["fullName"],
  email: OtpVerifyProps["email"],
  action: OtpVerifyProps["action"]
) => {
  try {
    let otp = Math.floor(1000 + Math.random() * 9000).toString();

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
            body: emailVerificationContent(fullName, otp),
          };
        case "PASS-RESET":
          return {
            subject: pwdResetSubject,
            body: pwdResetContent(fullName, otp),
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
  } catch (error: any) {
    throw new ApiError(500, error.message);
  }
};

const verifyOtp = async (email: string, clientOtp: string) => {
  try {
    if (!email || !email.includes("@") || !clientOtp) {
      throw new ApiError(401, "Email or Otp invalid format!");
    }

    const getDbOtp = await OtpModel.findOne({ email });
    if (!getDbOtp) {
      throw new ApiError(404, "Otp has expired!");
    }

    const doesOtpMatch = clientOtp?.trim() === getDbOtp.otp;
    if (!doesOtpMatch) {
      throw new ApiError(400, "Otp does not match!");
    }

    return doesOtpMatch;
  } catch (error: any) {
    throw new ApiError(500, error.message);
  }
};

const sendOtpMail = AsyncWrapper(async (req: Request, res: Response) => {
  const { email, action }: OtpVerifyProps = req.body;

  const isExistingUser = await UserModel.findOne({ email });

  if (action === "PASS-RESET" && !isExistingUser) {
    throw new ApiError(404, "User does not exist");
  }

  const getReceiverEmail = await sendEmailVerifyMail(
    isExistingUser?.fullName ?? "Foodie",
    email,
    action
  );

  return res.status(201).json(
    new ApiResponse(201, "Otp Sent Successfully!", {
      email: getReceiverEmail,
    })
  );
});

const verifyNewEmail = AsyncWrapper(async (req: Request, res: Response) => {
  const { clientOtp, email }: { clientOtp: string; email: string } = req.body;

  const verifiedUser = await verifyOtp(email, clientOtp);
  if (!verifiedUser) {
    throw new ApiError(400, "Otp does not match!");
  }

  const updateUser = await UserModel.findOneAndUpdate(
    { email },
    { $set: { isVerifiedEmail: true } },
    { new: true }
  ).select("-passwordHash -refreshToken");

  if (!updateUser) {
    throw new ApiError(500, "Updating User database failed!");
  }

  await OtpModel.deleteMany({ email });

  if (!updateUser.isVerifiedEmail) {
    throw new ApiError(500, "User email verification failed!");
  }

  // generate access/refresh tokens for registered user
  const { accessToken, refreshToken } = await GenerateAccessAndRefreshTokens(
    updateUser._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, "Otp verified and user registered Successfully!", {
        accessToken,
        refreshToken,
        user: updateUser,
      })
    );
});

const verifyPass = AsyncWrapper(async (req: Request, res: Response) => {
  const { clientOtp, email }: { clientOtp: string; email: string } = req.body;

  const verifiedUser = await verifyOtp(email, clientOtp);
  if (!verifiedUser) {
    throw new ApiError(400, "Otp does not match!");
  }

  const getUser = await UserModel.findOne({ email }).select(
    "-passwordHash -refreshToken"
  );
  if (!getUser) {
    throw new ApiError(404, "User does not exist");
  }
  await OtpModel.deleteMany({ email });

  const { accessToken, refreshToken } = await GenerateAccessAndRefreshTokens(
    getUser?._id
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, "Otp verified and user registered Successfully!", {
        accessToken,
        refreshToken,
        user: getUser,
      })
    );
});

export { sendEmailVerifyMail, sendOtpMail, verifyNewEmail, verifyPass };
