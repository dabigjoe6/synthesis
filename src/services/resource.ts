import AuthorModel, { AuthorI } from "../models/authors";
import UserModel, { UserI } from "../models/users";
import ResourceModel, { ResourceI } from "../models/resources";
import { Sources } from "../utils/constants";
import {
  extractMediumAuthorNameFromURL,
  extractSubstackAuthorNameFromURL,
  parseMediumUrl,
} from "../utils/scrapeHelpers";
import subscriptionPublisher from "../workers/subscriptions/subscriptionPublisher";
import mongoose from "mongoose";

export default class ResourceService {
  AuthorModel: mongoose.Model<AuthorI>;
  UserModel: mongoose.Model<UserI>;
  ResourceModel: mongoose.Model<ResourceI>;
  
  source: Sources;

  constructor(source: Sources) {
    this.AuthorModel = AuthorModel;
    this.UserModel = UserModel;
    this.ResourceModel = ResourceModel;
    this.source = source;
  }

  subscribe = async (email: string, url: string) => {
    let user = await this.UserModel.findOne({ email }).exec();

    if (!user) {
      user = await this.UserModel.create({ email });
    }

    if (this.source === Sources.MEDIUM) {
      // If URL matches https://josepholabisi.medium.com convert to https://medium.com/@josepholabisi
      // If URL matches https://medium.com/@josepholabisi leave as is
      url = parseMediumUrl(url);
    }

    let author = await this.AuthorModel.findOne({
      url,
    }).exec();

    if (!author) {
      //Handles the two URL styles in Medium to avoid duplicate subscribtions on the DB
      // Eg1: https://josepholabisi.medium.com
      // Eg2: https://medium.com/@josepholabisi/
      const name = this.getNameBasedOnSource(url);
      author = await this.AuthorModel.create({
        name,
        url,
        source: this.source,
      });

      try {
        subscriptionPublisher({
          authorId: author._id,
          service: this.source,
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
    return (newUser?.subscriptions || []);
  };

  getMostRecentPosts = async (authorId: string) => {
    const author = await this.AuthorModel.findById(authorId).exec();

    if (!author) {
      throw new Error("Author with author id: " + authorId + " does not exist");
    }

    const mostRecentPosts = await this.ResourceModel.find({ author: authorId })
      .limit(10)
      .exec();

    return mostRecentPosts;
  };

  getNameBasedOnSource = (url: string) => {
    switch (this.source) {
      case Sources.MEDIUM:
        return extractMediumAuthorNameFromURL(url);
      case Sources.SUBSTACK:
        return extractSubstackAuthorNameFromURL(url);
      default:
        return url;
    }
  };
}
