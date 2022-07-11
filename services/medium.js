import ResourceModel from "../models/resources";
import AuthorModel from "../models/authors";
import UserModel from "../models/users";
import { sources } from "../utils/constants.js";
import Medium from "../scrapers/Medium";

export default class MediumService {
  constructor() {
    this.ResourceModel = ResourceModel;
    this.AuthorModel = AuthorModel;
    this.UserModel = UserModel;
  }

  //TODO: Handle the two URL styles in Medium to avoid duplicate subscribtions on the DB
  // Eg1: https://josepholabisi.medium.com
  // Eg2: https://medium.com/@josepholabisi/
  subscribe = async (email, author) => {
    let user = await this.UserModel.findOne({ email }).exec();

    if (!user) {
      user = this.UserModel.create(email);
    }

    let author = await this.AuthorModel.findOne({
      $or: [{ name: author, url: author }],
    }).exec();

    if (!author) {
      const name = extractMediumAuthorNameFromURL(author);
      author = await this.AuthorModel.create({
        name,
        url: author,
        source: sources.MEDIUM,
      });

      //TODO: Should be done using rabbitMQ
      const mediumScraper = new Medium();
      let posts = await mediumScraper.getAllPosts(author);

      posts = posts.map((post) => ({
        ...post,
        source: source.MEDIUM,
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
