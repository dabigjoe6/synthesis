import dotenv from "dotenv";
import { startDb } from "../src/config/database.js";
import UserModel from "../src/models/users.js";
import sendUserFeed from "./publishers/sendFeedPublisher.js";

dotenv.config({ path: "../../.env" });

const generateUsersFeeds = async () => {
  startDb(process.env.MONGO_URI);
  console.log("Generating users feeds");

  const allUsersFeeds = await UserModel.aggregate([
    {
      $lookup: {
        from: "resources",
        localField: "subscriptions",
        foreignField: "author",
        as: "digest",
      },
    },
    {
      $project: {
        email: 1,
        digest: {
          $filter: {
            input: "$digest",
            as: "filteredDigest",
            cond: {
              $not: [{ $in: ["$$filteredDigest._id", "$seenResources"] }],
            },
          },
        },
      },
    },
    {
      $project: {
        email: 1,
        digest: 1,
        at_least_one_digest: { $gt: [{ $size: "$digest" }, 0] },
      },
    },
    {
      $match: {
        at_least_one_digest: true,
      },
    },
    {
      $project: {
        digest: {
          _id: 1,
        },
      },
    },
    {
      $unwind: {
        path: "$digest",
      },
    },
    {
      $sample: { size: Number(process.env.NO_OF_POSTS_SENT_TO_USERS) },
    },
    {
      $group: {
        _id: "$_id",
        digest: { $push: "$digest" },
      },
    },
  ]);

  console.log("UserFeeds", JSON.stringify(allUsersFeeds));

  allUsersFeeds.forEach((userFeed) => {
    if (userFeed.digest.length > 0) {
      sendUserFeed(
        userFeed._id,
        userFeed.digest.map((feed) => feed._id)
      );
    }
  });

  console.log("New feed generated for users successfully");
};

generateUsersFeeds();
