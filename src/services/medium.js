import AuthorModel from "../models/authors.js";
import UserModel from "../models/users.js";
import ResourceModel from "../models/resources.js";
import { sources } from "../utils/constants.js";
import {
  extractMediumAuthorNameFromURL,
  parseMediumUrl,
} from "../utils/scrapeHelpers.js";
import subscriptionPublisher from "../workers/publishers/subscriptionPublisher.js";

export default class MediumService {
  constructor() {
    this.AuthorModel = AuthorModel;
    this.UserModel = UserModel;
    this.ResourceModel = ResourceModel;
  }

  subscribe = async (email, url) => {
    let user = await this.UserModel.findOne({ email }).exec();

    if (!user) {
      user = await this.UserModel.create({ email });
    }

    // If URL matches https://josepholabisi.medium.com convert to https://medium.com/@josepholabisi
    // If URL matches https://medium.com/@josepholabisi leave as is
    url = parseMediumUrl(url);

    let author = await this.AuthorModel.findOne({
      url,
    }).exec();

    if (!author) {
      //Handles the two URL styles in Medium to avoid duplicate subscribtions on the DB
      // Eg1: https://josepholabisi.medium.com
      // Eg2: https://medium.com/@josepholabisi/
      const name = extractMediumAuthorNameFromURL(url);
      author = await this.AuthorModel.create({
        name,
        url,
        source: sources.MEDIUM,
      });

      try {
        subscriptionPublisher({
          authorId: author._id,
          service: sources.MEDIUM,
          url,
        });
      } catch (err) {
        throw "Couldn't subscribe" + err;
      }
    }

    const newUser = await this.UserModel.findOneAndUpdate(
      { _id: user._id },
      {
        $addToSet: { subscriptions: author._id },
      }
    );
    return newUser.subscriptions;
  };

  getMostRecentPosts = async (authorId) => {
    const author = await this.AuthorModel.findById(authorId).exec();

    if (!author) {
      throw new Error("Author with author id: " + authorId + " does not exist");
    }

    const mostRecentPosts = await this.ResourceModel.find({ author: authorId })
      .limit(10)
      .exec();

    return mostRecentPosts;
  };
}
