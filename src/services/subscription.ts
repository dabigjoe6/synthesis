import mongoose from "mongoose";
import AuthorModel, { AuthorI } from "../models/authors.js";
import UserModel, { UserMongooseI } from "../models/users.js";

export default class SubscriptionService {
  UserModel: mongoose.Model<UserMongooseI>;
  AuthorModel: mongoose.Model<AuthorI>;

  constructor() {
    this.UserModel = UserModel;
    this.AuthorModel = AuthorModel;
  }

  async getUserSubscriptions(email: string) {
    try {
      let user = await this.UserModel.findOne({ email }).exec();

      if (!user) {
        throw "Could not find user with email " + email;
      }

      return await this.UserModel.aggregate([
        {
          $match: {
            email,
          },
        },
        {
          $lookup: {
            from: "authors",
            localField: "subscriptions",
            foreignField: "_id",
            as: "subscriptions_info",
          },
        },
        {
          $unwind: "$subscriptions_info",
        },
        {
          $project: {
            subscription: "$subscriptions_info",
            _id: 0,
          },
        },
      ]);
    } catch (err) {
      console.error("Failed to get user subscriptions - subscription.ts", err)
      throw err;
    }
  };

  async unsubscribe(email: string, ids: mongoose.ObjectId[]) {
    try {
      let user = await this.UserModel.findOne({ email }).exec();

      if (!user) {
        throw "Could not find user with email " + email;
      }

      return await this.UserModel.updateOne(
        {
          email: email,
        },
        {
          $pullAll: {
            subscriptions: ids,
          },
        }
      );
    } catch (err) {
      console.error("Failed to remove subscription - subscription.ts", err)
      throw (err);
    }
  };
}
