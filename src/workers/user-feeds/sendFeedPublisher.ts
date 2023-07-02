import dotenv from "dotenv";
import { QUEUE } from "../../utils/constants.js";
import UserModel from '../../models/users.js';
import ResourceModel, { ResourceI } from '../../models/resources.js';
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

dotenv.config({ path: "../../../.env" });

const getPostsDigestData = (resources: Array<ResourceI>) => {
  const MAX_CHARACTERS = 5000;

  return resources.map(resource => {
    return {
      id: resource._id,
      url: resource.url,
      source: resource.source,
      content: resource.content && (resource.content.length > MAX_CHARACTERS) ? resource?.content?.substring(0, MAX_CHARACTERS) : resource.content,
      summary: resource?.summary,
      title: resource.title,
      description: resource.description,
      readLength: resource?.readLength,
      authorsName: resource?.authorsName,
      datePublished: resource?.datePublished
    }
  })
}

const sendUserFeed = async (userId: string, feed: string, latestPost: string, timeToSend: number) => {
  try {
    if (!userId) {
      throw new Error("User ID not defined - sendFeedPublished.ts");
    }
    const user = await UserModel.findOne({ _id: userId }).exec();

    const resources = await ResourceModel.find({
      _id: { $in: feed },
    }).exec();

    const latestResources = await ResourceModel.find({
      _id: { $in: latestPost },
    });

    const resourceIdsAndUrls = getPostsDigestData(resources)
    const latestResourceIdsAndUrls = getPostsDigestData(latestResources);

    const message = "sendfeedsynthesismessage" + JSON.stringify({
      id: user?._id,
      email: user?.email,
      isSummaryEnabled: (typeof user?.settings?.isSummaryEnabled === 'boolean') ? user.settings.isSummaryEnabled : true
    }) + "synthesismessage" + JSON.stringify(resourceIdsAndUrls) + "synthesismessage" + JSON.stringify(latestResourceIdsAndUrls) + "synthesismessage" + timeToSend
    console.log("sendFeedPublisher sending message: " + message);
    const params = {
      QueueUrl: QUEUE,
      MessageBody: message
    }

    const sqsClient = new SQSClient({ region: 'eu-west-2' });
    const data = await sqsClient.send(new SendMessageCommand(params));
    console.log("Success, message sent from sendFeedPublisher. MessageID:", data.MessageId);
  } catch (err) {
    throw err;
  }
}


export default sendUserFeed;
