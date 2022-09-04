import amqp from "amqplib/callback_api.js";
import { FEEDS_QUEUE } from "../../utils/constants.js";

const sendUserFeed = (userId, feed) => {
  amqp.connect("amqp://localhost", (err0, connection) => {
    if (err0) {
      throw err0;
    }

    connection.createChannel((err1, channel) => {
      if (err1) {
        throw err1;
      }

      const queue = FEEDS_QUEUE;
      const msg = userId + "_" + JSON.stringify(feed);

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
