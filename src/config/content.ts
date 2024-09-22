const emailVerificationSubject = "Your (O)ne-(T)ime-(P)ssword is here! 🍔";
const emailVerificationContent = (otp: number | string) => {
  return `<p>Hey Foodie,</p>
      <p>Thank you for registering to <b>BiteCircle 🍕🍜</b>! To confirm your account, please use the OTP code below:</p>
      <h2>${otp}</h2>
      <p>This code is valid for the next 10 minutes. Please do not share this code with anyone.</p>
      <p>If you did not request this code, please ignore this email.</p>
      <p>Thank you,<br>BiteCircle App,<br>created by <b><a href="https://www.linkedin.com/in/myself-shafi/" target="_blank">Shafi</a></b>.</p>`;
};

export { emailVerificationContent, emailVerificationSubject };
