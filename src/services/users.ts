import UserModel, { UserI } from "../models/users";
import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/auth";
import generateResetTokenHelper from "../utils/generateResetToken";
import mongoose, { ObjectId } from "mongoose";

export default class User {
  UserModel: mongoose.Model<UserI>;

  constructor() {
    this.UserModel = UserModel;
  }

  async updateUser(id: ObjectId, user: UserI) {
    return await this.UserModel.findByIdAndUpdate(id, user).exec();
  }

  async getUserByEmail(email: string) {
    return await this.UserModel.findOne({ email }).exec();
  }

  async getUserById(id: ObjectId) {
    return await this.UserModel.findById(id).exec();
  }

  async createUser(user: { email: string, password?: string}) {
    return await this.UserModel.create(user);
  }

  async deleteUser(id: ObjectId) {
    return await this.UserModel.findByIdAndDelete(id).exec();
  }

  hashPassword(password: string) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  }

  comparePassword(password: string, hash: string) {
    return password && hash && bcrypt.compareSync(password, hash);
  }

  generateToken(user: UserI) {
    return generateToken(user);
  }

  async generateResetPasswordToken(email: string) {
    const resetPasswordToken = generateResetTokenHelper();
    // TODO: Add expiry to reset password token
    await this.UserModel.updateOne({ email }, { resetPasswordToken });
    return resetPasswordToken;
  }

  async changePassword(email: string, newPassword: string) {
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
