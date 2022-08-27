import Medium from "./Medium.js";

const mediumScrapper = new Medium();

try {
  let posts = await mediumScrapper.getAllPosts("https://medium.com/@josepholab");

  if (posts) {
    console.log(posts, posts.length);
  }

} catch (err) {
  console.error(err);
}
