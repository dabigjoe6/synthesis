import ResourceModel from "../models/resources.js";
import AuthorModel from "../models/authors.js";
import UserModel from "../models/users.js";
import { sources } from "../utils/constants.js";
import { extractMediumAuthorNameFromURL } from "../utils/medium.js";
import Medium from "../scrapers/Medium.js";

export default class MediumService {
  constructor() {
    this.ResourceModel = ResourceModel;
    this.AuthorModel = AuthorModel;
    this.UserModel = UserModel;
  }

  //TODO: Handle the two URL styles in Medium to avoid duplicate subscribtions on the DB
  // Eg1: https://josepholabisi.medium.com
  // Eg2: https://medium.com/@josepholabisi/
  subscribe = async (email, url) => {
    let user = await this.UserModel.findOne({ email }).exec();

    if (!user) {
      user = this.UserModel.create({ email });
    }

    let author = await this.AuthorModel.findOne({
      $or: [{ name: url, url: url }],
    }).exec();

    if (!author) {
      const name = extractMediumAuthorNameFromURL(url);
      author = await this.AuthorModel.create({
        name,
        url: url,
        source: sources.MEDIUM,
      });

      //TODO: Should be done using rabbitMQ
      const mediumScraper = new Medium();
      let posts = await mediumScraper.getAllPosts(url);

      posts =
        posts &&
        posts.length > 0 &&
        posts.map((post) => ({
          ...post,
          source: sources.MEDIUM,
          author: author._id,
        }));

      //Update Resource collection with crawled articles
      await this.ResourceModel.create(posts);
    }

    this.UserModel.updateOne(
      { _id: user._id },
      {
        $push: { subscriptions: author._id },
      }
    );
  };
}
