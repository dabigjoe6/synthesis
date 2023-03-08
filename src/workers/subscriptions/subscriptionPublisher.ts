/** 
 *  Previously used to be a RabbitMQ publisher 
 *  Now publishes messages to AWS SQS
**/

import dotenv from "dotenv";
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import { Sources, QUEUE } from "../../utils/constants.js";
import mongoose from "mongoose";

dotenv.config({ path: "../../../.env" });

const subscriptionPublisher = async ({ authorId, url, service }: {
  authorId: mongoose.ObjectId;
  url: string;
  service: Sources;
}) => {
  try {
    const message = "subscriptionsynthesismessage" + authorId + "synthesismessage" + url + "synthesismessage" + service;
    console.log("subscriptionPublisher sending message: " + message);
    const params = {
      QueueUrl: QUEUE,
      MessageBody: message
    }

    const sqsClient = new SQSClient({ region: 'eu-west-2' });
    const data = await sqsClient.send(new SendMessageCommand(params))
    console.log("Success, message sent. MessageID:", data.MessageId);
  } catch (err) {
    throw err;
  }
};

export default subscriptionPublisher;
