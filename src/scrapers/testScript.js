import Medium from "./Medium.js";

const mediumScrapper = new Medium();

try {
  let posts = await mediumScrapper.getAllPosts("https://josepholabisi.medium.com");

  if (posts) {
    console.log(posts, posts.length);
  }

} catch (err) {
  console.error(err);
}
