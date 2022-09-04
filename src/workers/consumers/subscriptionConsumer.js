import dotenv from "dotenv";
import amqp from "amqplib/callback_api.js";
import Medium from "../../scrapers/Medium.js";
import ResourceModel from "../../models/resources.js";
import { startDb } from "../../config/database.js";
import { sources, SUBSCRIPTIONS_QUEUE } from "../../utils/constants.js";

dotenv.config({ path: "../../../.env" });

amqp.connect(process.env.RABBITMQ_URL, (err0, connection) => {
  if (err0) {
    console.log("subscriptionConsumer.js error: ", err0);
    throw err0;
  }

  connection.createChannel((err1, channel) => {
    if (err1) {
      console.log("subscriptionConsumer.js error: ", err1);
      throw err1;
    }

    startDb(process.env.MONGO_URI);

    channel.assertQueue(SUBSCRIPTIONS_QUEUE, {
      durable: true,
    });

    channel.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(
      queue,
      async (msg) => {
        const mediumScraper = new Medium();

        if (msg) {
          console.log("Received msg: " + msg.content.toString());
          const authorId = msg.content.toString().split("_")[0];
          const url = msg.content.toString().split("_")[1];

          console.log(
            "Scraping medium for authorId: " + authorId + " from URL: " + url
          );
          let posts = await mediumScraper.getAllPosts(url);

          posts =
            posts &&
            posts.length > 0 &&
            posts.map((post) => ({
              ...post,
              source: sources.MEDIUM,
              author: authorId,
            }));

          console.log("Saving posts to DB", JSON.stringify(posts[0]));
          //Update Resource collection with crawled articles
          await ResourceModel.create(posts);

          console.log("Succesfully saved posts!");
          channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  });
});
