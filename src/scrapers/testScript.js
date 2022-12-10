import Medium from "./Medium.js";
import Substack from "./Substack.js";

const tryMedium = async () => {
  const mediumScrapper = new Medium();

  try {
    let posts = await mediumScrapper.getAllPosts("https://josepholabisi.medium.com");
  
    if (posts) {
      console.log(posts, posts.length);
    }
  
  } catch (err) {
    console.error(err);
  }
}

const trySubstack = async () => {
  const substackScrapper = new Substack();

  try {
    let posts = await substackScrapper.getAllPosts("https://newsletter.pragmaticengineer.com");
  
    if (posts) {
      console.log(posts, posts.length);
    }
  
  } catch (err) {
    console.error(err);
  }
}


trySubstack();



