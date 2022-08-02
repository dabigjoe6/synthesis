import amqp from "amqplib/callback_api.js";

const subscriptionPublisher = (authorId, url) => {
  amqp.connect("amqp://localhost", (err0, connection) => {
    if (err0) {
      throw err0;
    }

    connection.createChannel((err1, channel) => {
      if (err1) {
        throw err1;
      }

      const queue = "subscriptions";
      const msg = authorId + "_" + url;

      channel.assertQueue(queue, {
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
