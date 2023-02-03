import dotenv from "dotenv";
import path from "path";
import amqp from "amqplib/callback_api.js";
import ResourceModel, { ResourceI } from "../../models/resources.js";
import { startDb } from "../../config/database.js";
import { Sources, SUBSCRIPTIONS_QUEUE } from "../../utils/constants.js";
import { fileURLToPath } from "url";
import lodash from "lodash";

import Medium from "../../scrapers/Medium.js";
import Substack from "../../scrapers/Substack.js";
import RSS from "../../scrapers/RSS.js";
import mongoose from "mongoose";

const { isArray } = lodash;

const __filename = fileURLToPath(import.meta.url);

dotenv.config({ path: path.resolve(__filename, "../../../../.env") });

const handleMediumService = async (authorId: mongoose.ObjectId, url: string): Promise<Partial<ResourceI>[]> => {
  const mediumScraper = new Medium();
  console.log(
    "Scraping medium for authorId: " + authorId + " from URL: " + url
  );
  return (await mediumScraper.getAllPosts(url)) || [];
};

const handleSubstackService = async (authorId: mongoose.ObjectId, url: string): Promise<Partial<ResourceI>[]> => {
  const substackScraper = new Substack();
  console.log(
    "Scraping substack for authorId: " + authorId + " from URL: " + url
  );
  return (await substackScraper.getAllPosts(url)) || [];
};

const handleRSSService = async (authorId: mongoose.ObjectId, url: string): Promise<Partial<ResourceI>[]> => {
  const rssScraper = new RSS();
  console.log(
    "Scraping RSS feed for authorId: " + authorId + " from URL: " + url
  );
  return (await rssScraper.getAllPosts(url)) || [];
}

const getPostsFromService = async (service: Sources, authorId: mongoose.ObjectId, url: string) => {
  let posts: Partial<ResourceI>[] = [];
  switch (service) {
    case Sources.MEDIUM:
      posts = await handleMediumService(authorId, url)
      break;
    case Sources.SUBSTACK:
      posts = await handleSubstackService(authorId, url);
      break;
    case Sources.RSS:
      posts = await handleRSSService(authorId, url);
      break;
    default:
      posts = [];
      throw new Error("Service not supported: " + service);
  }

  if (posts && isArray(posts) && posts.length > 0) {
    posts = posts.map((post) => ({
      ...post,
      source: service,
      author: authorId,
    }));

    console.log("Saving posts to DB");
    //Update Resource collection with crawled articles
    await ResourceModel.create(posts);

    console.log("Succesfully saved posts!");
  } else if (posts.length === 0) {
    console.warn("Empty posts");
  } else if (!isArray(posts)) {
    console.warn("Posts not an array, expecting an array");
  } else {
    console.warn("Posts is " + posts);
  }
};

amqp.connect(process.env.RABBITMQ_URL || "", (err0, connection) => {
  if (err0) {
    console.log("subscriptionConsumer.ts error: ", err0);
    throw err0;
  }

  connection.createChannel((err1, channel) => {
    if (err1) {
      console.log("subscriptionConsumer.ts error: ", err1);
      throw err1;
    }

    startDb(process.env.MONGO_URI);

    channel.assertQueue(SUBSCRIPTIONS_QUEUE, {
      durable: true,
    });

    channel.prefetch(1);
    console.log(
      " [*] Waiting for messages in %s. To exit press CTRL+C",
      SUBSCRIPTIONS_QUEUE
    );

    channel.consume(
      SUBSCRIPTIONS_QUEUE,
      async (msg) => {
        if (msg) {
          console.log("Received msg: " + msg.content.toString());
          const message = msg.content.toString().split("_");

          const authorId = (message[0] as unknown) as mongoose.ObjectId;
          if (!authorId) {
            throw new Error(
              "Could not get author Id - subscriptionConsumer.ts"
            );
          }
          const url = message[1];
          if (!url) {
            throw new Error(
              "Could not get authors url - subscriptionConsumer.ts"
            );
          }
          const service = (message[2] as unknown) as Sources;
          if (!service) {
            throw new Error(
              "Could not determine service - subscriptionConsumer.ts"
            );
          }

          await getPostsFromService(service, authorId, url);
          channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  });
});
