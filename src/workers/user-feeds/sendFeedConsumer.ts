import dotenv from "dotenv";
import amqp, { Message } from "amqplib/callback_api.js";
import Sendgrid from "@sendgrid/mail";
import mongoose from "mongoose";
import ResourceModel, { ResourceI } from "../../models/resources.js";
import UserModel from "../../models/users.js";
import { startDb } from "../../config/database.js";
import generateEmailTemplate from "../../utils/generateEmailTemplate.js";
import { FEEDS_QUEUE } from "../../utils/constants.js";
import { fileURLToPath } from "url";
import path from "path";
import MediumScraper from "../../scrapers/Medium.js";
import SubstackScraper from "../../scrapers/Substack.js";
import Summarizer from "../../utils/summarize.js";
import { Sources } from "../../utils/constants.js";
import { Channel } from "amqplib";

const __filename = fileURLToPath(import.meta.url);

dotenv.config({ path: path.resolve(__filename, "../../../../.env") });


const summarizeResources = async (resources: ResourceI[]) => {
  const summarizer = new Summarizer();

  try {
    for (const resource of resources) {
      if (!resource.summary) {
        switch (resource.source) {
          case Sources.MEDIUM:
            await summarizeMediumPost(resource, summarizer);
            break;
          case Sources.SUBSTACK:
            await summarizeSubstackPost(resource, summarizer);
            break;
          case Sources.RSS:
            await summarizeRSSPost(resource, summarizer);
            break;
          default:
            // do nothing
            break;
        }
      }
    }
  } catch (err) {
    console.error("Something went wrong with summarizing", err);
  }
}

const summarizeMediumPost = async (resource: ResourceI, summarizer: Summarizer) => {

  const mediumScraper = new MediumScraper();
  const mediumPost = await mediumScraper.getPost(resource.url);

  // summarize
  if (mediumPost) {
    resource.summary = await summarizer.summarize(mediumPost);
    resource.lastSummaryUpdate = new Date();
    resource.save();
  } else {
    throw new Error("Could not get medium post");
  }
};

const summarizeSubstackPost = async (resource: ResourceI, summarizer: Summarizer) => {
  const substackScraper = new SubstackScraper();
  const substackPost = await substackScraper.getPost(resource.url);

  // summarize
  if (substackPost) {
    resource.summary = await summarizer.summarize(substackPost);
    resource.lastSummaryUpdate = new Date();
    resource.save();
  } else {
    throw new Error("Could not get substack post");
  }
};

const summarizeRSSPost = async (resource: ResourceI, summarizer: Summarizer) => {
  if (resource.content) {
    resource.summary = await summarizer.summarize(resource.content);
    resource.lastSummaryUpdate = new Date();
    resource.save();
  }
}

amqp.connect(process.env.RABBITMQ_URL || "", (err0, connection) => {
  if (err0) {
    console.log("sendFeedConsumer.ts error: ", err0);
    throw err0;
  }

  connection.createChannel((err1: any, channel: Channel) => {
    if (err1) {
      console.log("sendFeedConsumer.ts error: ", err1);
      throw err1;
    }

    startDb(process.env.MONGO_URI);

    const queue = FEEDS_QUEUE;

    channel.assertQueue(queue, {
      durable: true,
    });

    channel.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(
      queue,
      async (msg) => {
        if (msg) {
          const messageContent = msg.content.toString();
          console.log("Received msg: " + messageContent);

          console.log("Getting feeds from DB");
          let resourceIds = JSON.parse(messageContent.split("_")[1]);
          if (!resourceIds) {
            throw new Error("Could not get resource Ids - sendFeedConsumer.ts");
          }
          resourceIds = resourceIds.map((resourceId: string) =>
            new mongoose.Types.ObjectId(resourceId)
          );
          const resources = await ResourceModel.find({
            _id: { $in: resourceIds },
          }).exec();

          let latestResourceIds = JSON.parse(messageContent.split("_")[2]);
          const latestResources = await ResourceModel.find({
            _id: { $in: latestResourceIds },
          });

          let userEmail;
          let userId;
          let user;

          try {
            console.log("Getting user from DB");
            userId = messageContent.split("_")[0];

            if (!userId) {
              throw new Error("User ID not defined - sendFeedConsumer.ts");
            }

            user = await UserModel.findOne({ _id: userId }).exec();
            userEmail = user?.email;
          } catch (err) {
            console.error("Couldn't get user: " + userEmail);
            throw err;
          }

          if (
            !!userEmail &&
            (resources.length > 0 || latestResources.length > 0)
          ) {
            try {
              console.log("Summarizing resources for user: " + userEmail);

              await summarizeResources(resources);
              await summarizeResources(latestResources);

              console.log("Done summarizing resources for user: " + userEmail);
            } catch (err) {
              console.error(
                "Couldn't summarize resources for user: " + userEmail
              );
              throw err;
            }

            try {
              console.log("Sending email to user: " + userEmail);
              const message = generateEmailTemplate(resources, latestResources);
              Sendgrid.setApiKey(process.env.SENDGRID_API_KEY || "");
              await Sendgrid.send({
                to: userEmail,
                from: (process.env.FROM || ""),
                subject: "Your personalized source for informative and inspiring content",
                text: "Your daily dose of knowledge, tailored for you: Stay informed effortlessly with your personal digest.",
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
                {
                  $push: {
                    seenResources: {
                      $each: [...resourceIds, ...latestResourceIds],
                    },
                  },
                }
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

            console.log("Succesfully sent " + userEmail + " digest");
            channel.ack(msg);
          } else {
            console.log("Bad email or no post(s) to send, skipping....");
            channel.reject(msg, false);
          }
        } else {
          console.log("Bad message, skipping....");
          channel.reject((msg || {}) as Message, false);
        }
      },
      {
        noAck: false,
      }
    );
  });
});
