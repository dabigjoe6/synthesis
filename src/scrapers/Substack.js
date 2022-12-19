import puppeteer from "puppeteer";
import { launchConfig, viewport } from "../config/puppeteer.js";
import { inifinteScrollToBottom } from "../utils/scrapeHelpers.js";

export default class Substack {
  async initPuppeteer() {
    this.browser = await puppeteer.launch(launchConfig);
    this.page = await this.browser.newPage();
    this.page.setViewport(viewport);
  }

  async getPostsMetaData(posts) {
    console.log("Generating metadata from posts");
    const result = [];

    for await (const post of posts) {
      // Get post URL
      const urlElement = await post.$('a[class~="post-preview-title"]');
      const href = urlElement && (await urlElement.getProperty("href"));
      const url = href && (await href.jsonValue());

      // Get post title
      const titleInnerHTML =
        urlElement && (await urlElement.getProperty("innerHTML"));
      const title = titleInnerHTML && (await titleInnerHTML.jsonValue());

      // Get post description
      const descriptionElement = await post.$(
        'a[class="post-preview-description"]'
      );
      const descriptionInnerHTML =
        descriptionElement &&
        (await descriptionElement.getProperty("innerHTML"));
      const description =
        descriptionElement && (await descriptionInnerHTML.jsonValue());

      // Get image
      const imageWrapper = await post.$('div[class="post-preview-image"]');
      const imageElement = imageWrapper && (await imageWrapper.$("img"));
      const imageSrc = imageElement && (await imageElement.getProperty("src"));
      const image = imageSrc && (await imageSrc.jsonValue());

      // Get author
      const authorWrapper = await post.$('div[class="profile-hover-wrapper"]');
      const authorElement = authorWrapper && (await authorWrapper.$("a"));
      const authorInnerHTML =
        authorElement && (await authorElement.getProperty("innerHTML"));
      const authorsName = authorInnerHTML && (await authorInnerHTML.jsonValue());

      // Get published date
      const timeElement = await post.$("time");
      const datePublished =
        timeElement &&
        (await this.page.evaluate(
          (el) => el.getAttribute("datetime"),
          timeElement
        ));

      // Get number of likes
      const likesWrapper = await post.$(
        'a[class="post-ufi-button style-compressed has-label with-border"]'
      );
      const likesElement =
        likesWrapper && (await likesWrapper.$('div[class="label"]'));
      const likes =
        likesElement && (await likesElement.getProperty("innerHTML"));
      const numberOfLikes = Number(likes && (await likes.jsonValue())) || 0;

      // Get number of comments
      const commentsWrapper = await post.$(
        'a[class="post-ufi-button style-compressed post-ufi-comment-button has-label with-border"]'
      );
      const commentsElement =
        commentsWrapper && (await commentsWrapper.$('div[class="label"]'));
      const comments =
        commentsElement && (await commentsElement.getProperty("innerHTML"));
      const numberOfComments = Number(comments && (await comments.jsonValue())) || 0;

      if (url && title) {
        result.push({
          url,
          title,
          description,
          image,
          authorsName,
          datePublished,
          numberOfLikes,
          numberOfComments,
        });
      }
    }

    console.log("Done generating metadata");

    return result;
  }

  // Checks if its a valid medium account
  async isPageValid() {
    const divElements = await this.page.$$("div");
    const anchorElements = await this.page.$$("a");
    let is404 = null;
    let isSubstackPage = false;
    for (const divElement of divElements) {
      const innerText = await this.page.evaluate(
        (el) => el.innerText,
        divElement
      );

      if (innerText.toLowerCase().includes("not found")) {
        is404 = innerText;
      }
    }

    for (const anchorElement of anchorElements) {
      const substackLink = await this.page.evaluate(
        (el) => el.getAttribute("href"),
        anchorElement
      );

      if (substackLink && substackLink.includes("substack.com")) {
        isSubstackPage = true;
      }
    }

    return !is404 && isSubstackPage;
  }

  async getAllPosts(authorsUrl) {
    try {
      await this.initPuppeteer();

      console.log("Visiting", authorsUrl);
      await this.page.goto(authorsUrl, { waitUntil: "networkidle2" });

      if (await this.isPageValid()) {
        console.log("Loaded", authorsUrl);

        const welcomeBtn = (
          await this.page.$$('button[aria-label="Close"]')
        )[0];

        if (welcomeBtn) {
          welcomeBtn.click();
          await this.page.waitForTimeout(1000);
        }

        const seeAllBtn = (
          await this.page.$$('a[href="/archive?sort=new"]')
        )[0];

        if (seeAllBtn) {
          seeAllBtn.click();
          await this.page.waitForTimeout(3000);
        }

        await inifinteScrollToBottom(this.page);

        const posts = await this.page.$$('div[class*="post-preview"]');

        const postsMetadata = await this.getPostsMetaData(posts);

        return postsMetadata
      } else {
        throw (
          "Could not fetch posts from author: " +
          authorsUrl +
          " as its not a valid Substack page"
        );
      }
    } catch (err) {
      console.log("Couldn't get all posts - substack", err);
    }
  }
}
