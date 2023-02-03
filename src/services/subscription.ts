import mongoose, { ObjectId } from "mongoose";
import AuthorModel, { AuthorI } from "../models/authors";
import UserModel, { UserI } from "../models/users";

export default class SubscriptionService {
  UserModel: mongoose.Model<UserI>;
  AuthorModel: mongoose.Model<AuthorI>;

  constructor() {
    this.UserModel = UserModel;
    this.AuthorModel = AuthorModel;
  }

  getUserSubscriptions = async (email: string) => {
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

  unsubscribe = async (email: string, ids: ObjectId[]) => {
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
