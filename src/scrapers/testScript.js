import Medium from "./Medium.js";

const mediumScrapper = new Medium();
let posts = await mediumScrapper.getAllPosts('https://netflixtechblog.medium.com');

console.log(posts, posts.length);