import Medium from "./Medium";
import Substack from "./Substack";
import RSS from "./RSS";

const tryMedium = async () => {
  const mediumScrapper = new Medium();

  try {
    let posts = await mediumScrapper.getAllPosts(
      "https://josepholabisi.medium.com"
    );

    if (posts) {
      console.log(posts, posts.length);
    }
  } catch (err) {
    console.error(err);
  }
};

const trySubstack = async () => {
  const substackScrapper = new Substack();

  try {
    let posts = await substackScrapper.getAllPosts(
      "https://timdenning.substack.com"
    );

    if (posts) {
      console.log(posts, posts.length);
    }
  } catch (err) {
    console.error(err);
  }
};

const tryRss = async () => {
  const rssScraper = new RSS();

  try {
    let posts = await rssScraper.getAllPosts(
      "https://blog.gregbrockman.com/feed"
    );

    if (posts) {
      console.log(posts, posts.length);
    }
  } catch (err) {
    console.error(err);
  }
};

const trySubstackPost = async () => {
  const substackScraper = new Substack();

  try {
    let post = await substackScraper.getPost("https://timdenning.substack.com/p/fixed-income-fixed-mindset");

    if (post) {
      console.log("Post", post);
    }
  } catch (err) {
    console.error(err);
  }
}

trySubstackPost();
