import jsdom from "jsdom";
import RssParser from "rss-parser";

const { JSDOM } = jsdom;

export default class RSS {
  async getPostsMetadata(posts) {
    console.log("Generating metadata from posts");
    const result = [];

    for await (const [index, post] of posts.entries()) {
      // Get post URL
      const url = post.link;

      // Get post title
      const title = post.title;

      // Get post description
      const description = post.contentSnippet;

      // Get post content
      const content = post.content;

      // Get image
      const dom = new JSDOM(post.content);
      const image = dom.window.document.querySelector("img")?.src;

      // Get published date
      const datePublished = post.pubDate;

      if (url && title) {
        result.push({
          url,
          title,
          image,
          description,
          datePublished,
          content,
          latest: index === 0,
        });
      }
    }

    console.log("Done generating metadata");

    return result;
  }

  async isPageValid() {
    return true;
  }

  async getAllPosts(authorsUrl) {
    try {
      console.log("Visiting", authorsUrl);
      const rssParser = new RssParser();
      let feed = await rssParser.parseURL(authorsUrl);

      console.log("Loaded", authorsUrl);
      if (feed && feed.items && feed.items.length) {
        const postsMetadata = await this.getPostsMetadata(feed.items);
        return postsMetadata;
      } else {
        throw new Error(
          "Could not fetch posts from author: " +
            authorsUrl +
            " as its not a valid RSS feed"
        );
      }
    } catch (err) {
      console.log("Couldn't get all posts - rss", err);
    }
  }
}
