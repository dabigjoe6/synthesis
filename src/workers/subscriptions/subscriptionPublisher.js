import dotenv from "dotenv";
import amqp from "amqplib/callback_api.js";
import { SUBSCRIPTIONS_QUEUE } from "../../utils/constants.js";

dotenv.config({ path: "../../../.env" });

const subscriptionPublisher = ({ authorId, url, service }) => {
  amqp.connect(process.env.RABBITMQ_URL, (err0, connection) => {
    if (err0) {
      throw err0;
    }

    connection.createChannel((err1, channel) => {
      if (err1) {
        throw err1;
      }

      const msg = authorId + "_" + url + "_" + service;

      channel.assertQueue(SUBSCRIPTIONS_QUEUE, {
        durable: true,
      });
      channel.sendToQueue(SUBSCRIPTIONS_QUEUE, Buffer.from(msg), {
        persistent: true,
      });

      console.log(" [x] Queue subscription of '%s'", msg);
    });
  });
};

export default subscriptionPublisher;
