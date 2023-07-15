import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { login, register, oAuthLogin, resetPassword, changePassword } from '.';
import Sendgrid from "@sendgrid/mail";

import UserService from '../../services/users.js';
import { UserI } from '../../models/users';

jest.mock('../../services/users.js');
const mockedUserService = UserService as jest.Mocked<typeof UserService>

let mockUser: UserI = {
  _id: "userId",
  email: "test@example.com",
  password: "hashedPassword",
  "subscriptions": [],
  "seenResources": []
};

let req: Request;
let res: Response;
let next: NextFunction;

beforeEach(() => {
  req = {
    body: {
      email: 'test@example.com',
      password: 'password',
    },
  } as Request;
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any;
  next = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Auth', () => {
  describe('login', () => {
    it('should return 404 if user is not found', async () => {
      await login(req, res, next);

      const mockedGetUserByEmail = mockedUserService.mock.instances[0].getUserByEmail;

      expect(mockedGetUserByEmail).toBeCalledWith('test@example.com');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found',
        status: 404,
      });
    });

    it('should return 400 if password is invalid', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(mockUser);

      await login(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(mockedUserService.mock.instances[0].comparePassword).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid password',
        status: 400,
      });
    });

    it('should return 200 with token and user object if login is successful', async () => {

      const getUserByEmailMock = jest.spyOn(UserService.prototype, "getUserByEmail").mockResolvedValue(mockUser);
      const comparePassword = jest.spyOn(UserService.prototype, "comparePassword").mockReturnValue(true);
      const generateTokenMock = jest.spyOn(UserService.prototype, "generateToken").mockReturnValue("token");

      await login(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(comparePassword).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(generateTokenMock).toHaveBeenCalledWith(mockUser);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        token: 'token',
        user: {
          _id: "userId",
          email: "test@example.com",
          "subscriptions": [],
          "seenResources": []
        },
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, "getUserByEmail").mockRejectedValue(new Error("Some error"))

      await login(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });

  })

  describe('register', () => {
    it('should return 401 if user already exists', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockResolvedValue(mockUser);

      await register(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User already exists',
        status: 401,
      });
    });

    it('should create a new user and return 201 with token and user object', async () => {
      const createUserMock = jest.spyOn(UserService.prototype, 'createUser').mockResolvedValue(mockUser);
      const hashPasswordMock = jest.spyOn(UserService.prototype, 'hashPassword').mockReturnValue('hashedPassword');
      const generateTokenMock = jest.spyOn(UserService.prototype, 'generateToken').mockReturnValue('token');
      const sendWelcomeEmailMock = jest.spyOn(UserService.prototype, 'sendWelcomeEmail').mockResolvedValue(undefined);

      await register(req, res, next);

      expect(hashPasswordMock).toHaveBeenCalledWith('password');
      expect(createUserMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'hashedPassword',
      });

      expect(generateTokenMock).toHaveBeenCalledWith(mockUser);
      expect(sendWelcomeEmailMock).toHaveBeenCalledWith('test@example.com');

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 201,
        token: 'token',
        user: {
          _id: 'userId',
          email: 'test@example.com',
          "subscriptions": [],
          "seenResources": []
        },
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockRejectedValue(new Error('Some error'));

      await register(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('oAuthLogin', () => {
    it('should create a new user and return 201 with token and user object if user does not exist', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockResolvedValue(null);
      const createUserMock = jest.spyOn(UserService.prototype, 'createUser').mockResolvedValue(mockUser);
      const generateTokenMock = jest.spyOn(UserService.prototype, 'generateToken').mockReturnValue('token');
      const sendWelcomeEmailMock = jest.spyOn(UserService.prototype, 'sendWelcomeEmail').mockResolvedValue(undefined);

      await oAuthLogin(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(createUserMock).toHaveBeenCalledWith({
        email: 'test@example.com',
      });

      expect(generateTokenMock).toHaveBeenCalledWith(mockUser);
      expect(sendWelcomeEmailMock).toHaveBeenCalledWith('test@example.com');

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 201,
        token: 'token',
        user: {
          _id: 'userId',
          email: 'test@example.com',
          subscriptions: [],
          seenResources: [],
        },
      });
    });

    it('should return 200 with token and user object if user already exists', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockResolvedValue(mockUser);
      const generateTokenMock = jest.spyOn(UserService.prototype, 'generateToken').mockReturnValue('token');

      await oAuthLogin(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(generateTokenMock).toHaveBeenCalledWith(mockUser);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        token: 'token',
        user: {
          _id: 'userId',
          email: 'test@example.com',
          subscriptions: [],
          seenResources: [],
        },
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockRejectedValue(new Error('Some error'));

      await oAuthLogin(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('resetPassword', () => {
    it('should return 404 if user is not found', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockResolvedValue(null);

      await resetPassword(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found',
        status: 404,
      });
    });

    it('should send reset code to user email and return 200 if user exists', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockResolvedValue(mockUser);
      const generateResetPasswordTokenMock = jest.spyOn(UserService.prototype, 'generateResetPasswordToken').mockResolvedValue('resetToken');
      const sendMock = jest.spyOn(Sendgrid, 'send').mockResolvedValue([{
        statusCode: 200,
        body: {},
        headers: {}
      }, {}]);

      await resetPassword(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(generateResetPasswordTokenMock).toHaveBeenCalledWith('test@example.com');
      expect(sendMock).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: '',
        subject: 'Reset Synthesis password',
        text: 'Hi there, a request was made to reset your Synthesis password',
        html: "<div>Click on this link to reset your password <br /> <a href=\"undefined/change-password/test@example.com/resetToken\">Click here</a> or copy and paste into your browser <strong>undefined/change-password/test@example.com/resetToken</strong></div>",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Reset code sent to e-mail',
        status: 200,
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockRejectedValue(new Error('Some error'));

      await resetPassword(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });

  describe('changePassword', () => {
    beforeEach(() => {
      req = {
        body: {
          email: 'test@example.com',
          password: 'currentPassword',
          newPassword: 'newPassword',
          resetPasswordToken: 'resetToken',
        },
      } as Request;

      mockUser = {
        ...mockUser,
        resetPasswordToken: 'resetToken',
        resetPasswordTokenCreatedAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
      };
    });

    afterEach(() => {
      mockUser = {
        _id: "userId",
        email: "test@example.com",
        password: "hashedPassword",
        "subscriptions": [],
        "seenResources": []
      };
    })

    it('should return 404 if user is not found', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockResolvedValue(null);

      await changePassword(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found',
        status: 404,
      });
    });

    it('should return 400 if resetPasswordToken is incorrect or expired', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockResolvedValue(mockUser);

      req.body.resetPasswordToken = 'incorrectToken';

      await changePassword(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Reset password token incorrect/expired',
        status: 400,
      });
    });

    it('should return 400 if resetPasswordToken is missing in the request body and password is incorrect', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockResolvedValue(mockUser);
      const comparePasswordMock = jest.spyOn(UserService.prototype, 'comparePassword').mockReturnValue(false);

      req.body.resetPasswordToken = '';

      await changePassword(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(comparePasswordMock).toHaveBeenCalledWith('currentPassword', 'hashedPassword');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Wrong password',
        status: 400,
      });
    });

    it('should change the user password and return 200 if current password is correct', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockResolvedValue(mockUser);
      const comparePasswordMock = jest.spyOn(UserService.prototype, 'comparePassword').mockReturnValue(true);
      const changePasswordMock = jest.spyOn(UserService.prototype, 'changePassword').mockResolvedValue(true);

      req.body.resetPasswordToken = '';

      await changePassword(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(comparePasswordMock).toHaveBeenCalledWith('currentPassword', 'hashedPassword');
      expect(changePasswordMock).toHaveBeenCalledWith('test@example.com', 'newPassword');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        token: undefined,
        email: 'test@example.com',
      });
    });

    it('should change the user password and return 200 if resetPasswordToken is correct and not expired', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockResolvedValue(mockUser);
      const changePasswordMock = jest.spyOn(UserService.prototype, 'changePassword');

      req.body.password = undefined;

      await changePassword(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(changePasswordMock).toHaveBeenCalledWith('test@example.com', 'newPassword');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User password reset',
        status: 200,
      });
    });

    it('should call the next function with the error if an error occurs', async () => {
      const getUserByEmailMock = jest.spyOn(UserService.prototype, 'getUserByEmail').mockRejectedValue(new Error('Some error'));

      await changePassword(req, res, next);

      expect(getUserByEmailMock).toHaveBeenCalledWith('test@example.com');
      expect(next).toHaveBeenCalledWith(new Error('Some error'));
    });
  });
})

