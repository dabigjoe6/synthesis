import AuthorModel from "../models/authors.js";
import UserModel from "../models/users.js";
import ResourceModel from "../models/resources.js";
import { sources } from "../utils/constants.js";
import subscriptionPublisher from "../workers/publishers/subscriptionPublisher.js";

export default class SubstackService {
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

    let author = await this.AuthorModel.findOne({
      url,
    }).exec();

    if (!author) {
      const name = url;
      author = await this.AuthorModel.create({
        name,
        url,
        source: sources.RSS,
      });

      try {
        subscriptionPublisher({
          authorId: author._id,
          service: sources.RSS,
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
