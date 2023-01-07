import puppeteer from "puppeteer";
import { launchConfig, viewport } from "../config/puppeteer.js";
import { inifinteScrollToBottom } from "../utils/scrapeHelpers.js";
export default class Medium {
  async initPuppeteer() {
    this.browser = await puppeteer.launch(launchConfig);
    this.page = await this.browser.newPage();
    this.page.setViewport(viewport);
  }

  async getPostsMetaData(posts) {
    console.log("Generating metadata from posts");
    const result = [];
    for await (const [index, post] of posts.entries()) {
      //Get post URL
      const urlElement = await post.$('a[aria-label="Post Preview Title"]');

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

      // Make sure there's at least url and title
      if (url && title) {
        result.push({
          url,
          title,
          description,
          image,
          latest: index === 0, // TODO: Fix this logic as there are pinned posts in Medium
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
    let isMediumPage = false;
    for (const divElement of divElements) {
      const innerText = await this.page.evaluate(
        (el) => el.innerText,
        divElement
      );

      if (innerText.toLowerCase().includes("page not found")) {
        is404 = innerText;
      }
    }

    for (const anchorElement of anchorElements) {
      const mediumIcon = await this.page.evaluate(
        (el) => el.getAttribute("href"),
        anchorElement
      );

      if (mediumIcon && mediumIcon.includes("medium.com")) {
        isMediumPage = true;
      }
    }

    return !is404 && isMediumPage;
  }

  async getAllPosts(authorsUrl, shouldScrollToBottom = true) {
    try {
      await this.initPuppeteer();

      console.log("Visiting ", authorsUrl);
      await this.page.goto(authorsUrl, { waitUntil: "networkidle2" });

      if (await this.isPageValid()) {
        console.log("Loaded", authorsUrl);

        if (shouldScrollToBottom) {
          await inifinteScrollToBottom(this.page);
        }

        const posts = await this.page.$$("article");

        const postsMetadata = await this.getPostsMetaData(posts);

        return postsMetadata;
      } else {
        throw new Error(
          "Could not fetch posts from author: " +
            authorsUrl +
            " as its not a valid medium page"
        );
      }
    } catch (err) {
      console.log("Couldn't get all posts - medium", err);
    }
  }

  async getPost(url) {
    try {
      // init puppeteer
      await this.initPuppeteer();

      console.log("Visiting ", url);

      await page.goto(url, { waitUntil: "networkidle2" });

      // check if page is valid
      const isValid = await page.evaluate(() => {
        const article = document.querySelector("article");
        return article && article.innerHTML;
      });

      if (isValid) {
        console.log("Loaded", url);

        const postContent = await page.$("article");

        const postContentInnerHTML =
          postContent && (await postContent.getProperty("innerHTML"));

        const postContentHTML =
          postContentInnerHTML && (await postContentInnerHTML.jsonValue());

        // remove all html tags and merge all text content
        const extractedText = postContentHTML.replace(/<[^>]*>?/gm, "");

        // TODO: Further preprocessing, remove code snippets, remove links, ... while maintaining content structure
        // Minimize the text to 200 words or so (based on GPT-3's max input length)

        return extractedText;
      } else {
        throw new Error(
          "Could not fetch post from url: " +
            url +
            " as its not a valid medium page"
        );
      }
    } catch (err) {
      console.log(`Couldn't get post - medium ${url}`, err);
    }
  }
}
