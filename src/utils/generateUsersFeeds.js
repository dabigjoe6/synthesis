import { startDb } from "../config/database.js";
import UserModel from "../models/users.js";
import sendUserFeed from "./publishers/sendFeedPublisher.js";

const NO_OF_POSTS_SENT_TO_USERS = 5;

const generateUsersFeeds = async () => {
  //TODO: Convert to environment file
  startDb(
    "mongodb+srv://olawwwale:zufgeH-tigquf-6zybfa@cluster0.eft2v.mongodb.net/morningbrew?retryWrites=true&w=majority"
  );
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
      $sample: { size: NUMBER_OF_POSTS_SENT_TO_USERS },
    },
    {
      $group: {
        _id: "$_id",
        digest: { $push: "$digest" },
      },
    },
  ]);

  console.log("UserFeeds", JSON.stringify(allUsersFeeds));

  //TODO: call sendFeedPublisher for every user
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
