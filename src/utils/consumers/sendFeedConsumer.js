import amqp from "amqplib/callback_api.js";
import Sendgrid from "@sendgrid/mail";
import mongoose from "mongoose";
import ResourceModel from "../../models/resources.js";
import UserModel from "../../models/users.js";
import { startDb } from "../../config/database.js";
import generateEmail from "../emails/generateEmail.js";

//TODO: Make amqp url an env virable
amqp.connect("amqp://localhost", (err0, connection) => {
  if (err0) {
    console.log("sendFeedConsumer.js error: ", err0);
    throw err0;
  }

  connection.createChannel((err1, channel) => {
    if (err1) {
      console.log("sendFeedConsumer.js error: ", err1);
      throw err1;
    }

    //TODO: Convert to environment file
    startDb(
      "mongodb+srv://olawwwale:zufgeH-tigquf-6zybfa@cluster0.eft2v.mongodb.net/morningbrew?retryWrites=true&w=majority"
    );

    //TODO: Make a constant
    const queue = "feeds";

    channel.assertQueue(queue, {
      durable: true,
    });

    channel.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(
      queue,
      async (msg) => {
        if (msg) {
          console.log("Received msg: " + msg.content.toString());

          console.log("Getting feeds from DB");
          let resourceIds = JSON.parse(msg.content.toString().split("_")[1]);
          resourceIds = resourceIds.map((resourceId) =>
            mongoose.Types.ObjectId(resourceId)
          );
          const resources = await ResourceModel.find({
            _id: { $in: resourceIds },
          }).exec();

          let userEmail;
          let userId;
          let user;

          try {
            console.log("Getting user from DB");
            userId = msg.content.toString().split("_")[0];
            user = await UserModel.findOne({ _id: userId }).exec();
            userEmail = user?.email;
          } catch (err) {
            console.error("Couldn't get user: " + userEmail);
            throw err;
          }

          console.log("User email " + userEmail, !!userEmail);
          if (!!userEmail && resources.length > 0) {
            try {
              console.log("Sending email to user: " + userEmail);
              const message = generateEmail(resources);
              console.log("Message", resources, message);
              //TODO: Change to env file
              Sendgrid.setApiKey(
                "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"
              );
              await Sendgrid.send({
                to: userEmail,
                from: "josepholabisi6000@gmail.com",
                subject: "Your daily morning brew",
                text: "Your daily morning brew is here",
                html: message,
              });
              console.log("Email sent to user: " + userEmail);
            } catch (err) {
              console.error("Couldn't send email to user: " + userEmail);
              throw err;
            }

            try {
              console.log("Marking resources as seen for user: " + userEmail);
              await UserModel.findOneAndUpdate(
                { _id: userId },
                { $push: { seenResources: { $each: resourceIds } } }
              );
              console.log(
                "Done marking resources as seen for user: " + userEmail
              );
            } catch (err) {
              console.error(
                "Couldn't mark resources as seen for user " + userEmail
              );
              throw err;
            }

            console.log("Succesfully sent " + userEmail + " morning brew");
            channel.ack(msg);
          } else {
            console.log("Bad email or no post(s) to send, skipping....");
            channel.reject(msg, false);
          }
        } else {
          console.log("Bad message, skipping....");
          channel.reject(msg, false);
        }
      },
      {
        noAck: false,
      }
    );
  });
});
