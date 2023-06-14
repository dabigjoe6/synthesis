/** 
 *  Publishes message to AWS SQS to send welcome email to users
**/

import dotenv from "dotenv";
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import { QUEUE } from "../../utils/constants.js";

dotenv.config({ path: "../../../.env" });

const welcomeEmailPublisher = async (email: string) => {
  try {
    const message = "welcomeemailsynthesismessage" + email + "synthesismessage";
    console.log("welcomeEmailPublisher sending message: " + message);
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

export default welcomeEmailPublisher;
