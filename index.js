import Medium from './scrapers/Medium.js';

const main = async () => {
  const mediumScraper = new Medium();

  //TODO: PROGRAMMATICALLY DEFINE WHAT AUTHOR IS SCRAPED
  await mediumScraper.getAllPosts("https://medium.com/@josepholabisi");
};

main();
