import UserModel from "../models/users.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/auth.js";
import generateResetTokenHelper from "../utils/generateResetToken.js";

export default class User {
  constructor() {
    this.UserModel = UserModel;
  }

  async updateUser(id, user) {
    return await this.UserModel.findByIdAndUpdate(id, user).exec();
  }

  async getUserByEmail(email) {
    return await this.UserModel.findOne({ email }).exec();
  }

  async getUserById(id) {
    return await this.UserModel.findById(id).exec();
  }

  async createUser(user) {
    return await this.UserModel.create(user);
  }

  async deleteUser(id) {
    return await this.UserModel.findByIdAndDelete(id).exec();
  }

  hashPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }

  comparePassword(password, hash) {
    return password && hash && bcrypt.compareSync(password, hash);
  }

  generateToken(user) {
    return generateToken(user);
  }

  async generateResetPasswordToken(email) {
    const resetPasswordToken = generateResetTokenHelper();
    // TODO: Add expiry to reset password token
    await this.UserModel.updateOne({ email }, { resetPasswordToken });
    return resetPasswordToken;
  }

  async changePassword(email, newPassword) {
    await this.UserModel.updateOne(
      { email },
      {
        password: this.hashPassword(newPassword),
        $unset: { resetPasswordToken: 1 },
      }
    );
    return true;
  }
}
