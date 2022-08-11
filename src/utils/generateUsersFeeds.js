import { startDb } from "../config/database.js";
import UserModel from "../models/users.js";

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
        digest: {
          _id: 1,
        },
      },
    },
  ]);

  //TODO: call sendFeedPublisher for every user
};


generateUsersFeeds();
