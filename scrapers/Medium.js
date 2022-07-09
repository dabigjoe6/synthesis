import puppeteer from "puppeteer";
import { inifinteScrollToBottom } from "../utility/infiniteScrollToBottom.js";
export default class Medium {
  MEDIUM_URL = 'https://medium.com';

  constructor(username) {
    this.username = username;
  }

  async initPuppeteer() {
    this.browser = await puppeteer.launch({headless: false});
    this.page = await this.browser.newPage();
  }

  async getPostsMetaData(posts) {
    const result = [];
    
    for await (const post of posts) {

      //Get post URL
      const urlElement = await post.$('a');
      const href = await urlElement.getProperty('href');
      const url = await href.jsonValue();

      //Get post title
      const titleElement = await post.$('h2');
      const titleInnerHTML = await titleElement.getProperty('innerHTML');
      const title = await titleInnerHTML.jsonValue();

      //Get description
      const descriptionElement = await post.$('a > div > p');
      const descriptionInnerHTML = await descriptionElement.getProperty('innerHTML');
      const description = await descriptionInnerHTML.jsonValue();

      //Get image
      const imageElement = await post.$('img');
      const imageElementSrc = await imageElement.getProperty('src');
      const image = await imageElementSrc.jsonValue();

      result.push({
        url,
        title,
        description,
        image
      })
    }

    return result;
  };

  async getAllPosts(authorPage) {
    try {
      await this.initPuppeteer();
      
      console.log("Visiting ", authorPage);
      await this.page.goto(authorPage, { waitUntil: 'networkidle2'});
      console.log("Loaded", authorPage);

      console.log("Scrolling to bottom");
      await inifinteScrollToBottom(this.page);
      console.log("Scrolled to bottom");


      console.log("Scraping articles");
      const posts = await this.page.$$('article');
      console.log("Done scraping articles");

      console.log("Generating metadata")
      const postsMetadata = await this.getPostsMetaData(posts);

      console.log("METADATA", postsMetadata);

    } catch (err) {
      console.log("Couldn't get all posts - medium", err);
    }
  }
}