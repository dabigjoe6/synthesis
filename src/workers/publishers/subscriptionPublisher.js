import amqp from "amqplib/callback_api.js";
import { SUBSCRIPTIONS_QUEUE } from "../../utils/constants.js";

const subscriptionPublisher = (authorId, url) => {
  amqp.connect("amqp://localhost", (err0, connection) => {
    if (err0) {
      throw err0;
    }

    connection.createChannel((err1, channel) => {
      if (err1) {
        throw err1;
      }

      const msg = authorId + "_" + url;

      channel.assertQueue(SUBSCRIPTIONS_QUEUE, {
        durable: true,
      });
      channel.sendToQueue(queue, Buffer.from(msg), {
        persistent: true,
      });

      console.log(" [x] Queue subscription of '%s'", msg);
    });
  });
};

export default subscriptionPublisher;
