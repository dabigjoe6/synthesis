import puppeteer from "puppeteer";
export default class Medium {
  MEDIUM_URL = 'https://medium.com';

  constructor(username) {
    this.username = username;
  }

  async initPuppeteer() {
    this.browser = await puppeteer.launch({headless: false});
    this.page = await this.browser.newPage();
  }

  //TODO: GET OTHER METADATA, LIKE TITLE, DESCRIPTION, TAGS.....WHATEVER YOU CAN GET
  async getPostsMetaData(posts) {
    const result = [];
    
    for await (const post of posts) {
      const aTag = await post.$('a');
      const href = await aTag.getProperty('href');
      const url = await href.jsonValue();
      result.push({
        url
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

      const posts = await this.page.$$('article');
      const postsMetadata = await this.getPostsMetaData(posts);

      console.log("METADATA", postsMetadata);

    } catch (err) {
      console.log("Couldn't get all posts - medium", err);
    }
  }
}