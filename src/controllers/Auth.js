import Sendgrid from "@sendgrid/mail";
import UserService from "../services/users.js";
import generateResetPasswordTemplate from "../utils/generateResetPasswordTemplate.js";
import { generateToken } from "../middleware/auth.js";

export const login = async (req, res, next) => {
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

    if (!userService.comparePassword(password, user.password)) {
      return res.status(400).json({
        message: "Invalid password",
        status: 400,
      });
    }

    const token = userService.generateToken(user);

    user = user.toObject();
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

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

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
      password: password && userService.hashPassword(password),
    });

    const token = userService.generateToken(user);

    user = user.toObject();
    delete user["password"];

    res.status(201).json({
      status: 201,
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const oAuthLogin = async (req, res, next) => {
  try {
    const { email } = req.body;

    const userService = new UserService();
    let user = await userService.getUserByEmail(email);

    if (!user) {
      user = await userService.createUser({
        email,
        password: password && userService.hashPassword(password),
      });

      const token = userService.generateToken(user);

      user = user.toObject();
      delete user["password"];

      return res.status(201).json({
        status: 201,
        token,
        user,
      });
    } else {
      const token = userService.generateToken(user);

      user = user.toObject();
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

export const resetPassword = async (req, res, next) => {
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
    const FROM = process.env.FROM;
    const SUBJECT = "Reset MorningBrew password";
    const TEXT =
      "Hi there, a request was made to reset your MorningBrew password";
    const MESSAGE = generateResetPasswordTemplate(
      resetPasswordToken,
      user.email
    );

    const payload = {
      to: user.email,
      from: FROM,
      subject: SUBJECT,
      text: TEXT,
      html: MESSAGE,
    };

    // TODO: Add this to messaging queue
    Sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
    await Sendgrid.send(payload);

    res.status(200).json({
      message: "Reset code sent to e-mail",
      status: 200,
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
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
      const result = userService.comparePassword(password, user.password);
      if (!result) {
        return res.status(400).json({
          message: "wrong password",
          status: 400,
        });
      }

      const token = generateToken(user);
      await userService.changePassword(email, newPassword);

      return res.status(200).json({
        status: 200,
        token,
        email: user.email,
      });
    }

    if (resetPasswordToken !== user.resetPasswordToken) {
      return res.status(400).json({
        message: "Reset password token incorrect",
        status: 400,
      });
    }

    await userService.changePassword(email, newPassword);

    res.status(200).json({
      message: "User password reset",
      status: 200,
    });
  } catch (err) {
    next(err);
  }
};
