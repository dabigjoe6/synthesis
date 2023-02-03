import dotenv from "dotenv";
import path from "path";
import amqp from "amqplib/callback_api.js";
import { startDb } from "../../config/database.js";
import { Sources, SYNC_RESOURCES_QUEUE } from "../../utils/constants.js";
import { fileURLToPath } from "url";
import lodash from "lodash";

import AuthorModel from "../../models/authors.js";
import ResourceModel, { ResourceI } from "../../models/resources.js";

import Medium from "../../scrapers/Medium.js";
import Substack from "../../scrapers/Substack.js";
import RSS from "../../scrapers/RSS.js";

import ResourceService from "../../services/resource.js";
import mongoose from "mongoose";

const { isArray } = lodash;

const __filename = fileURLToPath(import.meta.url);

dotenv.config({ path: path.resolve(__filename, "../../../../.env") });

const syncPosts = async (newPosts: ResourceI[], mostRecentPostsInDb: ResourceI[], service: Sources, authorId: mongoose.ObjectId) => {
  if (!newPosts) {
    console.error(
      "newPosts is undefined but required - syncResourcesConsumer"
    );
    return;
  }

  if (isArray(newPosts) && !newPosts.length) {
    console.warn("No new posts - syncResourcesConsumer");
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
  const newPostsNotInDb: ResourceI[] = [];
  const mostRecentPostsMap: {
    [key: string]: ResourceI
  } = {};

  mostRecentPostsInDb.forEach((mostRecentPost) => {
    mostRecentPostsMap[mostRecentPost.url] = mostRecentPost;
  });

  newPosts.forEach((newPost) => {
    if (newPost.url && !(newPost.url in mostRecentPostsMap)) {
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

const getScraperInstance = (source: Sources) => {
  switch (source) {
    case Sources.MEDIUM:
      return new Medium();
    case Sources.SUBSTACK:
      return new Substack();
    case Sources.RSS:
      return new RSS();
    default:
      throw new Error("Not a valid source - syncResourcesConsumer");
  }
};

const handleService = async (authorId: mongoose.ObjectId, url: string, source: Sources) => {
  const scraperInstance = getScraperInstance(source);
  const resourceService = new ResourceService(source);

  console.log(
    "Getting most recent posts in DB from authorId: " +
    authorId +
    " from URL: " +
    url
  );
  const mostRecentPostsInDb = await resourceService.getMostRecentPosts(
    (authorId as unknown) as string
  );

  console.log(
    "Scraping source for authorId: " + authorId + " from URL: " + url
  );
  const newPosts = (await scraperInstance.getAllPosts(url, false)) as ResourceI[];

  await syncPosts(newPosts, mostRecentPostsInDb, source, authorId);
};

amqp.connect(process.env.RABBITMQ_URL || "", (err0, connection) => {
  if (err0) {
    console.log("syncResourcesConsumer error: ", err0);
    throw err0;
  }

  connection.createChannel((err1, channel) => {
    if (err1) {
      console.log("syncResourcesConsumer error: ", err1);
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

          const authorId = (message[0] as unknown) as mongoose.ObjectId;
          if (!authorId) {
            throw new Error(
              "Could not get author Id - syncResourcesConsumer"
            );
          }
          const url = message[1];
          if (!url) {
            throw new Error(
              "Could not get authors url - syncResourcesConsumer"
            );
          }
          const service = (message[2] as unknown) as Sources;
          if (!service) {
            throw new Error(
              "Could not determine service - syncResourcesConsumer"
            );
          }

          await handleService(authorId, url, service);
          channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  });
});
