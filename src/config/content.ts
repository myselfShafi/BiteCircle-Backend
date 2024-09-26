const emailVerificationSubject = "Your (O)ne-(T)ime-(P)ssword is here! 🍔";
const emailVerificationContent = (fullName: string, otp: number | string) => {
  return `<h2>Hey ${fullName ?? "Foodie"},</h2>
      <p>Thank you for registering to <b>BiteCircle 🍕🍜</b>! To confirm your account, please use the OTP code below:</p>
      <h2>${otp}</h2>
      <p>This code is valid for the next 10 minutes. Please do not share this code with anyone.</p>
      <p>If you did not request this code, please ignore this email.</p>
      <p>Thank you,<br><b>BiteCircle App</b>,<br>Created by <b><a href="https://www.linkedin.com/in/myself-shafi/" target="_blank">Shafi</a></b>.</p>`;
};

const pwdResetSubject =
  "🍕 Forgot Your Password? Let’s Get You Back to the Feast!";
const pwdResetContent = (fullName: string, otp: number | string) => {
  return `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hi there, ${fullName ?? "foodie"}!</h2>
        <p>It seems like you've forgotten your password, but no worries—Here’s your One-Time Password (OTP) to reset your password:</p>
              <h2>${otp}</h2>
        <p>This OTP is valid for the next 10 minutes. Please enter it in the app to reset your password.</p>
        <p>If you didn't request this, just ignore this email. Your account is safe!</p>
        <br/>
        <p>Stay hungry, stay happy! 📸</p>
        <p>Thank you,<br><b>BiteCircle App</b>,<br>Created by <b><a href="https://www.linkedin.com/in/myself-shafi/" target="_blank">Shafi</a></b>.</p>
      </div>`;
};

export {
  emailVerificationContent,
  emailVerificationSubject,
  pwdResetContent,
  pwdResetSubject,
};
