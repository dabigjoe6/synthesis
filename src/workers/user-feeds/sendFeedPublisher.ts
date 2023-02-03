import dotenv from "dotenv";
import amqp from "amqplib/callback_api";
import { FEEDS_QUEUE } from "../../utils/constants";

dotenv.config({ path: "../../../.env" });

const sendUserFeed = (userId: string, feed: string, latestPost: string) => {
  amqp.connect(process.env.RABBITMQ_URL || "", (err0, connection) => {
    if (err0) {
      throw err0;
    }

    connection.createChannel((err1, channel) => {
      if (err1) {
        throw err1;
      }

      const queue = FEEDS_QUEUE;
      const msg = userId + "_" + JSON.stringify(feed) + "_" + JSON.stringify(latestPost);

      channel.assertQueue(queue, {
        durable: true,
      });
      channel.sendToQueue(queue, Buffer.from(msg), {
        persistent: true,
      });

      console.log(" [x] Queue feed of '%s'", msg);
    });
  });
};

export default sendUserFeed;
