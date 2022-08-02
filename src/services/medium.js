import AuthorModel from "../models/authors.js";
import UserModel from "../models/users.js";
import { sources } from "../utils/constants.js";
import { extractMediumAuthorNameFromURL } from "../utils/medium.js";
import subscriptionPublisher from "../utils/publishers/subscriptionPublisher.js";

export default class MediumService {
  constructor() {
    this.AuthorModel = AuthorModel;
    this.UserModel = UserModel;
  }

  subscribe = async (email, url) => {
    let user = await this.UserModel.findOne({ email }).exec();

    if (!user) {
      user = this.UserModel.create({ email });
    }

    let author = await this.AuthorModel.findOne({
      $or: [{ name: url, url: url }],
    }).exec();

    if (!author) {
      //Handles the two URL styles in Medium to avoid duplicate subscribtions on the DB
      // Eg1: https://josepholabisi.medium.com
      // Eg2: https://medium.com/@josepholabisi/
      const name = extractMediumAuthorNameFromURL(url);
      author = await this.AuthorModel.create({
        name,
        url: url,
        source: sources.MEDIUM,
      });

      try {
        subscriptionPublisher(author._id, url);
      } catch (err) {
        throw "Couldn't subscribe" + err;
      }
    }

    this.UserModel.updateOne(
      { _id: user._id },
      {
        $push: { subscriptions: author._id },
      }
    );
  };
}
