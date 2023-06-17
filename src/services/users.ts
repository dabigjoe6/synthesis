import UserModel, { FrequencyType, UserI, WeekDays } from "../models/users.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/auth.js";
import generateResetTokenHelper from "../utils/generateResetToken.js";
import welcomeEmailPublisher from '../workers/email/welcomeEmailPublisher.js';
import mongoose from "mongoose";

export default class User {
  UserModel: mongoose.Model<UserI>;

  constructor() {
    this.UserModel = UserModel;
  }

  async updateUser(id: mongoose.ObjectId, user: UserI) {
    return await this.UserModel.findByIdAndUpdate(id, user).exec();
  }

  async getUserByEmail(email: string) {
    return await this.UserModel.findOne({ email }).exec();
  }

  async getUserById(id: mongoose.ObjectId) {
    return await this.UserModel.findById(id).exec();
  }

  async createUser(user: { email: string, password?: string }) {
    return await this.UserModel.create(user);
  }

  async deleteUser(id: mongoose.ObjectId) {
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

  async markSeenResources(id: mongoose.ObjectId, seenResources: Array<mongoose.ObjectId>) {
    await this.UserModel.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          seenResources: {
            $each: [...seenResources],
          },
        },
      }
    );
    console.log(
      "Done marking resources as seen for user: " + id
    );
  }

  async pauseDigest(userId: mongoose.ObjectId) {
    await this.UserModel.findOneAndUpdate(
      { _id: userId },
      { "settings.isDigestPaused": true }
    )
  }

  async resumeDigest(userId: mongoose.ObjectId) {
    await this.UserModel.findOneAndUpdate(
      { _id: userId },
      { "settings.isDigestPaused": false }
    )
  }

  async enableSummary(userId: mongoose.ObjectId) {
    await this.UserModel.findOneAndUpdate(
      { _id: userId },
      { "settings.isSummaryEnabled": true }
    )
  }

  async disableSummary(userId: mongoose.ObjectId) {
    await this.UserModel.findOneAndUpdate(
      { _id: userId },
      { "settings.isSummaryEnabled": false }
    )
  }

  async setDigestFrequency(userId: mongoose.ObjectId, frequency: {
    frequencyType: FrequencyType,
    time: Array<string>,
    days: (Array<WeekDays> | undefined),
    timeZone: string
  }) {
    await this.UserModel.findOneAndUpdate(
      { _id: userId },
      { "settings.frequency": frequency }
    )
  }


  async generateResetPasswordToken(email: string) {
    const resetPasswordToken = generateResetTokenHelper();
    const resetPasswordTokenCreatedAt = Date.now;
    await this.UserModel.updateOne({ email }, { resetPasswordToken, resetPasswordTokenCreatedAt });
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

  async sendWelcomeEmail(email: string) {
    try {
      await welcomeEmailPublisher(email);
    } catch (err) {
      console.error("Could not send welcome email, something went wrong: ", err);
    }
  }
}
