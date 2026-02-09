import type { Response, Request } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { transporter } from "../config/nodemailer";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";
export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;
      const userExist = await User.findOne({ email: email }).lean();
      if (userExist) {
        const error = new Error("The user is already registered");
        return res.status(409).json({ error: error.message });
      }
      const user = new User(req.body);

      user.password = await hashPassword(password);
      const token = new Token();
      token.token = generateToken();
      token.user = user._id;

      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.send("Account created, check your e-mail to confirm your account");
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Not valid token");
        res.status(404).json({ error: error.message });
      }

      const user = await User.findById(tokenExist.user);
      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);
      res.send("The account has been confirmed successfully");
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("User not found");
        return res.status(404).json({ error: error.message });
      }
      if (!user.confirmed) {
        const token = new Token();
        token.user = user._id;
        token.token = generateToken();
        await token.save();

        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        const error = new Error(
          "The account was not confirmed, we send a confirmation email",
        );
        return res.status(401).json({ error: error.message });
      }

      const isPasswordCorrect = await checkPassword(password, user.password);
      if (!isPasswordCorrect) {
        const error = new Error("incorrect Password");
        res.status(401).json({ error: error.message });
      }
      const token = generateJWT({ id: user._id });
      return res.send(token);
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
        const error = new Error("The user is not registered");
        return res.status(404).json({ error: error.message });
      }

      const token = new Token();
      token.token = generateToken();
      token.user = user._id;

      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);
      res.send("New token has been sent it");
    } catch (error) {
      console.log(error);

      res.status(500).json({ error: "There was an error" });
    }
  };
  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
        const error = new Error("The user is not registered");
        return res.status(404).json({ error: error.message });
      }
      const token = new Token();
      token.token = generateToken();
      token.user = user._id;
      await token.save();
      AuthEmail.sendPasswordResentToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      res.send("Check your E-mail for intructions");
    } catch (error) {
      console.log(error);

      res.status(500).json({ error: "There was an error" });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      console.log(token);

      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Not valid token");
        res.status(404).json({ error: error.message });
      }
      res.send("Valid Token, define you new password");
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };
  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const tokenExist = await Token.findOne({ token });
      if (!tokenExist) {
        const error = new Error("Not valid token");
        res.status(404).json({ error: error.message });
      }
      const user = await User.findById(tokenExist.user);
      user.password = await hashPassword(password);
      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);
      res.send("Your passoword has been changed successfully!");
    } catch (error) {
      res.status(500).json({ error: "There was an error" });
    }
  };
  static user = async (req: Request, res: Response) => {
    return res.json(req.user);
  };
  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists && userExists._id.toString() !== req.user._id.toString()) {
      const error = new Error("Email already taken");
      return res.status(409).json({ error: error.message });
    }
    req.user.name = name;
    req.user.email = email;
    try {
      await req.user.save();
      return res.send("Profile update was successfully");
    } catch (error) {
      return res.status(500).json({ error: "There was an error" });
    }
  };
  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;
    try {
      const user = await User.findById(req.user._id);

      const isPasswordCorrect = await checkPassword(
        current_password,
        user.password,
      );

      if (!isPasswordCorrect) {
        const error = new Error("The current password is not correct");
        return res.status(401).json({ error: error.message });
      }

      user.password = await hashPassword(password);
      await user.save();
      return res.send("Password update was successfully");
    } catch (error) {
      return res.status(500).json({ error: "There was an error" });
    }
  };
  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    try {
      const user = await User.findById(req.user._id);

      const isPasswordCorrect = await checkPassword(password, user.password);

      if (!isPasswordCorrect) {
        const error = new Error("The  password is not correct");
        return res.status(401).json({ error: error.message });
      }

      return res.send("Correct Password");
    } catch (error) {
      return res.status(500).json({ error: "There was an error" });
    }
  };
}
