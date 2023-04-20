import AuthorModel, { AuthorI } from "../models/authors.js";
import UserModel, { UserI } from "../models/users.js";
import ResourceModel, { ResourceI } from "../models/resources.js";
import { Sources } from "../utils/constants.js";
import {
  extractMediumAuthorNameFromURL,
  extractSubstackAuthorNameFromURL,
  parseMediumUrl,
} from "../utils/helpers.js";
import subscriptionPublisher from "../workers/subscriptions/subscriptionPublisher.js";
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

  saveAuthorsPosts = async (posts: ResourceI, authorId?: mongoose.ObjectId) => {
    await this.ResourceModel.create(posts);
    if (authorId) {
      await this.AuthorModel.updateOne({ _id: authorId }, { lastSynced: Date.now() });
    }
  }

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

  updateResourceSummary = async (resources: Array<{ id: string, summary: string, readLength: string }>) => {
    for (const resource of resources) {
      await this.ResourceModel.findOneAndUpdate({ _id: resource.id }, {
        summary: resource.summary,
        readLength: resource.readLength
      })
    }
  }
}
