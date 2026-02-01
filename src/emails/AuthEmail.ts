import { transporter } from "../config/nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface IEmail {
  email: string;
  name: string;
  token: string;
}
export class AuthEmail {
  static sendConfirmationEmail = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: "uptask <admin@admin.com>",
      to: user.email,
      subject: "Confirm your account",
      text: "Confirm your account",
      html: `<p>Hi: ${user.name}, your a account  has just been created, confirm the email</p>
      
      <p>See</p>
      <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirm Account </a>
      <p>Add this code: <b>${user.token}</b> </p>
      <p>This token expires in 10 minutes</p>
      
      
      
      `,
    });
  };

  static sendPasswordResentToken = async (user: IEmail) => {
    const info = await transporter.sendMail({
      from: "uptask <admin@admin.com>",
      to: user.email,
      subject: "Restore your passowrd",
      text: "Restore your passowrd",
      html: `<p>Hi: ${user.name}, you requested restore your password.</p>
      
      <p>See</p>
      <a href="${process.env.FRONTEND_URL}/auth/new-password">Restore Password</a>
      <p>Add this code: <b>${user.token}</b> </p>
      <p>This token expires in 10 minutes</p>
      
      
      
      `,
    });

    console.log(info.messageId);
  };
}
