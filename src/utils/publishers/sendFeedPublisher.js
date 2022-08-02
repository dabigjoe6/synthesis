import amqp from "amqplib/callback_api.js";

const sendUserFeed = (userId, feed) => {
  amqp.connect("amqp://localhost", (err0, connection) => {
    if (err0) {
      throw err0;
    }

    connection.createChannel((err1, channel) => {
      if (err1) {
        throw err1;
      }

      //TODO: Make a constant
      const queue = "feeds";
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
