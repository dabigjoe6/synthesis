import AuthorModel from "../models/authors.js";
import UserModel from "../models/users.js";

export default class SubscriptionService {
  constructor() {
    this.UserModel = UserModel;
    this.AuthorModel = AuthorModel;
  }

  getUserSubscriptions = async (email) => {
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
      throw ("Failed to get user subscriptions - subscription.js", err);
    }
  };

  unsubscribe = async (email, ids) => {
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
      throw ("Failed to remove subscription - subscription.js", err);
    }
  };
}
