import dotenv from "dotenv";
import { startDb } from "../../config/database.js";
import UserModel from "../../models/users.js";
import sendUserFeed from "./sendFeedPublisher.js";
import { fileURLToPath } from "url";
import path from "path";
import 'moment-timezone';
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
  const TIME_WINDOW_IN_HOURS = 1;
  const TIME_FORMAT = "HH:mm";


  // set timezone to GMT+0
  moment.tz.setDefault('Etc/GMT');

  const allUsersFeeds = await UserModel.aggregate([
    // Match all users with frequencyType daily or users with frequencyType weekly and have selected today as one of the days
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
    // Match all users that have selected a time for the next hour
    {
      $match: {
        "settings.frequency.time": {
          $elemMatch: {
            $gt: moment().format(TIME_FORMAT), // current time with leading zero
            $lte: moment().startOf('hour').add(TIME_WINDOW_IN_HOURS, 'hours').format(TIME_FORMAT)
          }
        }
      }
    },
    // Find all resources from subscribed authors for every user
    {
      $lookup: {
        from: "resources",
        localField: "subscriptions",
        foreignField: "author",
        as: "digest",
      },
    },
    // Filter out users that have paused their digests
    {
      $project: {
        email: 1,
        digest: 1,
        settings: 1,
        seenResources: 1,
        isDigestPaused: { "$ifNull": ["$settings.isDigestPaused", "value_not_set"] },
      },
    },
    {
      $project: {
        email: 1,
        digest: 1,
        seenResources: 1,
        is_digest_not_paused: {
          $or: [
            { $eq: ["$isDigestPaused", "value_not_set"] },
            { $eq: ["$settings.isDigestPaused", false] }
          ] // We want to remove users that have paused their digests
        },
      },
    },
    {
      $match: {
        is_digest_not_paused: true,
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
    // Get the latest post from the users digest if any
    {
      $project: {
        email: 1,
        settings: 1,
        digest: {
          $filter: {
            input: "$digest",
            as: "digest",
            cond: { $ne: ["$$digest.latest", true] }, // Removes the latest articles from the rest of the digest so we don't end up with repition
          },
        },
        latest: {
          $filter: {
            input: "$digest",
            as: "digest",
            cond: { $eq: ["$$digest.latest", true] },
          },
        },
      },
    },
    // Filter out users with no feed/digest to send
    {
      $project: {
        email: 1,
        digest: 1,
        latest: 1,
        at_least_one_digest: {
          $or: [
            { $gt: [{ $size: "$digest" }, 0] },
            { $gt: [{ $size: "$latest" }, 0] },
          ],
        },
      },
    },
    {
      $match: {
        at_least_one_digest: true,
      },
    },
    // Pick a digest at random
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
        latest: 1,
        // We assume the job runs every xx:00 hour and users are only allowed to pick times for xx:00
        // If job runs for 06:00, we schedule emails to be sent out using sendgrid for users that have selected 07:00
        timeToSend: process.env.NODE_ENV === "development" ? moment().add(1, 'minute').format(TIME_FORMAT) : moment().startOf('hour').add(TIME_WINDOW_IN_HOURS, 'hour').format(TIME_FORMAT)
      },
    },
  ]);

  for (const userFeed of allUsersFeeds) {
    if (userFeed.digest.length > 0) {
      const time = userFeed.timeToSend;
      const timestampInSeconds = moment(time, TIME_FORMAT).unix();

      await sendUserFeed(
        userFeed._id,
        userFeed.digest.map((feed: ResourceI) => feed._id),
        userFeed.latest.map((feed: ResourceI) => feed._id),
        timestampInSeconds
      );
    }
  }

  console.log("New feed generated for users successfully");
};

await generateUsersFeeds();

process.exit();
