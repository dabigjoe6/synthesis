import dotenv from "dotenv";
import path from "path";
import amqp from "amqplib/callback_api.js";
import { startDb } from "../../config/database.js";
import { sources, SYNC_RESOURCES_QUEUE } from "../../utils/constants.js";
import { fileURLToPath } from "url";
import lodash from "lodash";

import AuthorModel from "../../models/authors.js";
import ResourceModel from "../../models/resources.js";

import MediumService from "../../services/medium.js";
import SubstackService from "../../services/substack.js";
import RSSService from "../../services/rss.js";

import Medium from "../../scrapers/Medium.js";
import Substack from "../../scrapers/Substack.js";
import RSS from "../../scrapers/RSS.js";

const { isArray } = lodash;

const __filename = fileURLToPath(import.meta.url);

dotenv.config({ path: path.resolve(__filename, "../../../../.env") });

const syncPosts = async (newPosts, mostRecentPostsInDb, service, authorId) => {
  if (!newPosts) {
    console.error(
      "newPosts is undefined but required - syncResourcesConsumer.js"
    );
    return;
  }

  if (isArray(newPosts) && !newPosts.length) {
    console.warn("No new posts - syncResourcesConsumer.js");
    return;
  }

  if (
    !mostRecentPostsInDb ||
    (isArray(mostRecentPostsInDb) && !mostRecentPostsInDb.length)
  ) {
    let posts = newPosts.map((post) => ({
      ...post,
      source: service,
      author: authorId,
    }));

    console.log("Saving posts to DB");
    //Update Resource collection with new posts
    await ResourceModel.create(posts);
    // Update last synced time for Author
    await AuthorModel.updateOne({ _id: authorId }, { lastSynced: Date.now() });

    return;
  }

  // Check for new posts thats does not exist in DB
  const newPostsNotInDb = [];
  const mostRecentPostsMap = {};

  mostRecentPostsInDb.forEach((mostRecentPost) => {
    mostRecentPostsMap[mostRecentPost.url] = mostRecentPost;
  });

  newPosts.forEach((newPost) => {
    if (!(newPost.url in mostRecentPostsMap)) {
      newPostsNotInDb.push(newPost);
    }
  });

  let posts = newPostsNotInDb.map((post) => ({
    ...post,
    source: service,
    author: authorId,
  }));

  console.log("Saving posts to DB");
  await ResourceModel.updateMany(
    { author: authorId },
    { $set: { latest: false } }
  ).exec();
  //Update Resource collection with crawled articles
  await ResourceModel.create(posts);
  //Update last synced time for Author
  await AuthorModel.updateOne({ _id: authorId }, { lastSynced: Date.now() });
};

const handleMediumService = async (authorId, url) => {
  const mediumScraper = new Medium();
  const mediumService = new MediumService();

  console.log(
    "Getting most recent posts in DB from authorId: " +
      authorId +
      " from URL: " +
      url
  );
  const mostRecentPostsInDb = await mediumService.getMostRecentPosts(authorId);

  console.log(
    "Scraping medium for authorId: " + authorId + " from URL: " + url
  );
  const newPosts = await mediumScraper.getAllPosts(url, false);

  await syncPosts(newPosts, mostRecentPostsInDb, sources.MEDIUM, authorId);
};

const handleSubstackService = async (authorId, url) => {
  const substackScraper = new Substack();
  const substackService = new SubstackService();

  console.log(
    "Getting most recent posts in DB from authorId: " +
      authorId +
      " from URL: " +
      url
  );
  const mostRecentPostsInDb = await substackService.getMostRecentPosts(
    authorId
  );

  console.log(
    "Scraping substack for authorId: " + authorId + " from URL: " + url
  );
  const newPosts = await substackScraper.getAllPosts(url, false);
  await syncPosts(newPosts, mostRecentPostsInDb, sources.SUBSTACK, authorId);
};

const handleRSSService = async (authorId, url) => {
  const rssScraper = new RSS();
  const rssService = new RSSService();

  console.log(
    "Getting most recent posts in DB from authorId: " +
      authorId +
      " from URL: " +
      url
  );
  const mostRecentPostsInDb = await rssService.getMostRecentPosts(authorId);

  console.log(
    "Scraping RSS feed for authorId: " + authorId + " from URL: " + url
  );
  const newPosts = await rssScraper.getAllPosts(url);
  await syncPosts(newPosts, mostRecentPostsInDb, sources.RSS, authorId);
};

const getPostsFromServiceAndSyncService = async (service, authorId, url) => {
  try {
    switch (service) {
      case sources.MEDIUM:
        await handleMediumService(authorId, url);
        break;
      case sources.SUBSTACK:
        await handleSubstackService(authorId, url);
        break;
      case sources.RSS:
        await handleRSSService(authorId, url);
        break;
      default:
        throw new Error("Service not supported: " + service);
    }
  } catch (err) {
    console.error("Error", err);
    throw new Error("Could not sync posts - syncResourcesConsumer.js", err);
  }
};

amqp.connect(process.env.RABBITMQ_URL, (err0, connection) => {
  if (err0) {
    console.log("syncResourcesConsumer.js error: ", err0);
    throw err0;
  }

  connection.createChannel((err1, channel) => {
    if (err1) {
      console.log("syncResourcesConsumer.js error: ", err1);
      throw err1;
    }

    startDb(process.env.MONGO_URI);

    channel.assertQueue(SYNC_RESOURCES_QUEUE, {
      durable: true,
    });

    channel.prefetch(1);
    console.log(
      " [*] Waiting for messages in %s. To exit press CTRL+C",
      SYNC_RESOURCES_QUEUE
    );

    channel.consume(
      SYNC_RESOURCES_QUEUE,
      async (msg) => {
        if (msg) {
          console.log("Received msg: " + msg.content.toString());
          const message = msg.content.toString().split("_");

          const authorId = message[0];
          if (!authorId) {
            throw new Error(
              "Could not get author Id - syncResourcesConsumer.js"
            );
          }
          const url = message[1];
          if (!url) {
            throw new Error(
              "Could not get authors url - syncResourcesConsumer.js"
            );
          }
          const service = message[2];
          if (!service) {
            throw new Error(
              "Could not determine service - syncResourcesConsumer.js"
            );
          }

          await getPostsFromServiceAndSyncService(service, authorId, url);
          channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  });
});
