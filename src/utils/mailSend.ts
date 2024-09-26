import { createTransport } from "nodemailer";
import { MailOptions } from "nodemailer/lib/sendmail-transport";
import ApiError from "./helpers/ApiError";

const handleMailSend = async (
  receiver: string,
  mailSubject: string,
  mailBody: string
) => {
  try {
    const transporter = createTransport({
      host: process.env.MAIL_HOST,
      // port: 465, but this is outdated so we will use default 587
      // secure: true, // 465 then true, 587 then false
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PWD,
      },
    });
    const mailOptions: MailOptions = {
      from: {
        name: "BiteCircle || by Shafi ",
        address: process.env.MAIL_DISPLAY_USER as string,
      },
      to: receiver,
      replyTo: process.env.MAIL_DISPLAY_USER as string,
      subject: mailSubject,
      html: mailBody,
    };
    const sendMail = await transporter.sendMail(mailOptions);
    if (sendMail.rejected.length > 0) {
      throw new ApiError(500, "Failed to send mail!");
    }
    return sendMail;
  } catch (error) {
    throw new ApiError(500, "Nodemailer Error.. " + error);
  }
};

export default handleMailSend;
