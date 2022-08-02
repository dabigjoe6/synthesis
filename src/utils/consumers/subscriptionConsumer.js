import amqp from "amqplib/callback_api.js";
import Medium from "../../scrapers/Medium.js";
import ResourceModel from "../../models/resources.js";
import { startDb } from "../../config/database.js";
import { sources } from "../constants.js";

//TODO: Make amqp url an env virable
amqp.connect("amqp://localhost", (err0, connection) => {
  if (err0) {
    console.log("subscriptionConsumer.js error: ", err0);
    throw err0;
  }

  connection.createChannel((err1, channel) => {
    if (err1) {
      console.log("subscriptionConsumer.js error: ", err1);
      throw err1;
    }

    //TODO: Convert to environment file
    startDb(
      "mongodb+srv://olawwwale:zufgeH-tigquf-6zybfa@cluster0.eft2v.mongodb.net/morningbrew?retryWrites=true&w=majority"
    );

    const queue = "subscriptions";

    channel.assertQueue(queue, {
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

          console.log("Saving posts to DB");
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
