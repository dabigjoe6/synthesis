import puppeteer from "puppeteer";
import { inifinteScrollToBottom } from "../utilities/infiniteScrollToBottom.js";
export default class Medium {
  MEDIUM_URL = "https://medium.com";

  constructor(username) {
    this.username = username;
  }

  async initPuppeteer() {
    this.browser = await puppeteer.launch({ headless: false });
    this.page = await this.browser.newPage();
  }

  async getPostsMetaData(posts) {
    console.log("Generating metadata from posts");
    const result = [];
    for await (const post of posts) {
      //Get post URL
      const urlElement = await post.$("a");
      const href = urlElement && (await urlElement.getProperty("href"));
      const url = href && (await href.jsonValue());

      //Get post title
      const titleElement = await post.$("h2");
      const titleInnerHTML =
        titleElement && (await titleElement.getProperty("innerHTML"));
      const title = titleInnerHTML && (await titleInnerHTML.jsonValue());

      //Get description
      const descriptionElement = await post.$("a > div > p");
      const descriptionInnerHTML =
        descriptionElement &&
        (await descriptionElement.getProperty("innerHTML"));
      const description =
        descriptionInnerHTML && (await descriptionInnerHTML.jsonValue());

      //Get image
      const imageElement = await post.$("img");
      const imageElementSrc =
        imageElement && (await imageElement.getProperty("src"));
      const image = imageElementSrc && (await imageElementSrc.jsonValue());

      result.push({
        url,
        title,
        description,
        image,
      });
    }

    console.log("Done generating metadata");

    return result;
  }

  async getAllPosts(authorPage) {
    //TODO: Handle username that doesn't exist
    try {
      await this.initPuppeteer();

      console.log("Visiting ", authorPage);
      await this.page.goto(authorPage, { waitUntil: "networkidle2" });
      console.log("Loaded", authorPage);

      await inifinteScrollToBottom(this.page);

      const posts = await this.page.$$("article");

      const postsMetadata = await this.getPostsMetaData(posts);

      return postsMetadata;
    } catch (err) {
      console.log("Couldn't get all posts - medium", err);
    }
  }
}
