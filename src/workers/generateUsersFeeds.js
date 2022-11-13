import dotenv from "dotenv";
import { startDb } from "../config/database.js";
import UserModel from "../models/users.js";
import sendUserFeed from "./publishers/sendFeedPublisher.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);

dotenv.config({ path: path.resolve(__filename, "../../../.env") });

const generateUsersFeeds = async () => {
  startDb(process.env.MONGO_URI);
  console.log("Generating users feeds");

  const allUsersFeeds = await UserModel.aggregate([
    // Find all resources from subscribed authors for every user
    {
      $lookup: {
        from: "resources",
        localField: "subscriptions",
        foreignField: "author",
        as: "digest",
      },
    },
    // Filter resources that have been previously sent to the user
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
    // Filter out users with no feed/digest to send
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
    // Picks a digest at random
    // TODO: Use slice to get a number of random digest for the user
    {
      $project: {
        digest: [
          {
            $arrayElemAt: [
              "$digest",
              {
                $mod: [
                  {
                    $toLong: "$$NOW",
                  },
                  {
                    $size: "$digest",
                  },
                ],
              },
            ],
          },
        ],
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