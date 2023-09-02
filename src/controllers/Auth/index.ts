import Sendgrid from "@sendgrid/mail";
import { Request, Response, NextFunction } from 'express';
import UserService from "../../services/users.js";
import generateResetPasswordTemplate from "../../utils/generateResetPasswordTemplate.js";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const userService = new UserService();
    let user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }

    if (!userService.comparePassword(password, user?.password || "")) {
      return res.status(400).json({
        message: "Invalid password",
        status: 400,
      });
    }

    const token = userService.generateToken(user);

    delete user["password"];

    return res.status(200).json({
      status: 200,
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, time, timeZone } = req.body;

    const userService = new UserService();

    let _user = await userService.getUserByEmail(email);

    if (_user) {
      return res.status(401).json({
        message: "User already exists",
        status: 401,
      });
    }


    let user = await userService.createUser({
      email,
      time,
      timeZone,
      password: password && userService.hashPassword(password),
    });

    const token = userService.generateToken(user);

    delete user["password"];

    await userService.sendWelcomeEmail(email);

    res.status(201).json({
      status: 201,
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const oAuthLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, time, timeZone } = req.body;

    const userService = new UserService();
    let user = await userService.getUserByEmail(email);

    if (!user) {
      user = await userService.createUser({
        email,
        time,
        timeZone
      });

      const token = userService.generateToken(user);

      delete user["password"];

      await userService.sendWelcomeEmail(email);

      return res.status(201).json({
        status: 201,
        token,
        user,
      });
    } else {
      const token = userService.generateToken(user);

      delete user["password"];

      return res.status(200).json({
        status: 200,
        token,
        user,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const userService = new UserService();
    let user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }
    const resetPasswordToken = await userService.generateResetPasswordToken(
      user.email
    );
    const FROM = process.env.FROM || "";
    const SUBJECT = "Reset Synthesis password";
    const TEXT =
      "Hi there, a request was made to reset your Synthesis password";
    const MESSAGE = generateResetPasswordTemplate(
      resetPasswordToken,
      user.email
    );

    const payload: Sendgrid.MailDataRequired = {
      to: user.email,
      from: FROM,
      subject: SUBJECT,
      text: TEXT,
      html: MESSAGE,
    };

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "";
    Sendgrid.setApiKey(SENDGRID_API_KEY);
    await Sendgrid.send(payload);

    res.status(200).json({
      message: "Reset code sent to e-mail",
      status: 200,
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, newPassword, resetPasswordToken } = req.body;

    const userService = new UserService();
    const user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });
    }

    if (!resetPasswordToken) {
      const result = userService.comparePassword(password, user?.password || "");
      if (!result) {
        return res.status(400).json({
          message: "Wrong password",
          status: 400,
        });
      }

      const token = userService.generateToken(user);
      await userService.changePassword(email, newPassword);

      return res.status(200).json({
        status: 200,
        token,
        email: user.email,
      });
    }

    const oneHourAgo = Date.now() - 60 * 60 * 1000; // Calculate a number representing one hour ago

    if (user.resetPasswordToken && user.resetPasswordTokenCreatedAt) {
      if (resetPasswordToken !== user.resetPasswordToken || oneHourAgo > user.resetPasswordTokenCreatedAt) {
        return res.status(400).json({
          message: "Reset password token incorrect/expired",
          status: 400,
        });
      } else {
        await userService.changePassword(email, newPassword);

        res.status(200).json({
          message: "User password reset",
          status: 200,
        });
      }
    } else {
      return res.status(400).json({
        message: "Reset password token incorrect/expired",
        status: 400,
      });
    }


  } catch (err) {
    next(err);
  }
};
