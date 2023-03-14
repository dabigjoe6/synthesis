import dotenv from "dotenv";
import { startDb } from "../../config/database.js";
import UserModel from "../../models/users.js";
import sendUserFeed from "./sendFeedPublisher.js";
import { fileURLToPath } from "url";
import path from "path";
import moment from 'moment';
import { ResourceI } from "../../models/resources.js";

const __filename = fileURLToPath(import.meta.url);

dotenv.config({ path: path.resolve(__filename, "../../../../.env") });

const getCurrentDayOfWeek = () => {
  const today = moment();
  const dayOfWeek = today.format('ddd');
  return dayOfWeek.toLowerCase()
}

const generateUsersFeeds = async () => {
  startDb(process.env.MONGO_URI);
  console.log("Generating users feeds");


  const CURRENT_DAY = getCurrentDayOfWeek();

  const allUsersFeeds = await UserModel.aggregate([
    {
      $match: {
        $or: [
          { "settings.frequency.frequencyType": "daily" },
          {
            "settings.frequency.frequencyType": "weekly",
            "settings.frequency.days": CURRENT_DAY
          }
        ]
      }
    },
    // {
    //   $match: {
    //     "settings.frequency.frequencyType": "daily",
    //     // "settings.frequency.time": {
    //     //   $elemMatch: {
    //     //     $expr: {
    //     //       $gt: [
    //     //         {
    //     //           $subtract: [
    //     //             "$$NOW",
    //     //             {
    //     //               $dateFromString: {
    //     //                 dateString: {
    //     //                   $concat: [
    //     //                     {
    //     //                       $dateToString: {
    //     //                         date: "$$NOW",
    //     //                         format: "%Y-%m-%d"
    //     //                       }
    //     //                     },
    //     //                     "T",
    //     //                     "$$this",
    //     //                     ":00.000Z"
    //     //                   ]
    //     //                 }
    //     //               }
    //     //             }
    //     //           ]
    //     //         },
    //     //         3 * 60 * 60 * 1000
    //     //       ]
    //     //     }
    //     //   }
    //     // }
    //   }
    // },
    // // Find all resources from subscribed authors for every user
    // {
    //   $lookup: {
    //     from: "resources",
    //     localField: "subscriptions",
    //     foreignField: "author",
    //     as: "digest",
    //   },
    // },
    // // Filter out users that have paused their digests
    // {
    //   $project: {
    //     email: 1,
    //     digest: 1,
    //     settings: 1,
    //     seenResources: 1,
    //     isDigestPaused: { "$ifNull": ["$settings.isDigestPaused", "value_not_set"] },
    //   },
    // },
    // {
    //   $project: {
    //     email: 1,
    //     digest: 1,
    //     seenResources: 1,
    //     is_digest_not_paused: {
    //       $or: [
    //         { $eq: ["$isDigestPaused", "value_not_set"] },
    //         { $eq: ["$settings.isDigestPaused", false] }
    //       ] // We want to remove users that have paused their digests
    //     },
    //   },
    // },
    // {
    //   $match: {
    //     is_digest_not_paused: true,
    //   },
    // },
    // // Filter resources that have been previously sent to the user
    // {
    //   $project: {
    //     email: 1,
    //     digest: {
    //       $filter: {
    //         input: "$digest",
    //         as: "filteredDigest",
    //         cond: {
    //           $not: [{ $in: ["$$filteredDigest._id", "$seenResources"] }],
    //         },
    //       },
    //     },
    //   },
    // },
    // // Get the latest post from the users digest if any
    // {
    //   $project: {
    //     email: 1,
    //     settings: 1,
    //     digest: {
    //       $filter: {
    //         input: "$digest",
    //         as: "digest",
    //         cond: { $ne: ["$$digest.latest", true] }, // Removes the latest articles from the rest of the digest so we don't end up with repition
    //       },
    //     },
    //     latest: {
    //       $filter: {
    //         input: "$digest",
    //         as: "digest",
    //         cond: { $eq: ["$$digest.latest", true] },
    //       },
    //     },
    //   },
    // },
    // // Filter out users with no feed/digest to send
    // {
    //   $project: {
    //     email: 1,
    //     digest: 1,
    //     latest: 1,
    //     at_least_one_digest: {
    //       $or: [
    //         { $gt: [{ $size: "$digest" }, 0] },
    //         { $gt: [{ $size: "$latest" }, 0] },
    //       ],
    //     },
    //   },
    // },
    // {
    //   $match: {
    //     at_least_one_digest: true,
    //   },
    // },
    // // Pick a digest at random
    // // TODO: Use slice to get a number of random digest for the user
    // {
    //   $project: {
    //     digest: [
    //       {
    //         $arrayElemAt: [
    //           "$digest",
    //           {
    //             $mod: [
    //               {
    //                 $toLong: "$$NOW",
    //               },
    //               {
    //                 $size: "$digest",
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //     ],
    //     latest: 1,
    //   },
    // },
  ]);

  console.log("User Feed", allUsersFeeds);

  // for (const userFeed of allUsersFeeds) {
  //   if (userFeed.digest.length > 0) {
  //     await sendUserFeed(
  //       userFeed._id,
  //       userFeed.digest.map((feed: ResourceI) => feed._id),
  //       userFeed.latest.map((feed: ResourceI) => feed._id)
  //     );
  //   }
  // }

  console.log("New feed generated for users successfully");
};

await generateUsersFeeds();

process.exit();
