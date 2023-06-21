import dotenv from "dotenv";
import { startDb } from "../../config/database.js";
import AuthorModel from "../../models/authors.js";
import ResourceModel from '../../models/resources.js';
import syncResourcesPublisher from "./syncResourcesPublisher.js";
import { fileURLToPath } from "url";
import path from "path";
import { Sources } from "../../utils/constants.js";

const __filename = fileURLToPath(import.meta.url);

dotenv.config({ path: path.resolve(__filename, "../../../../.env") });

const getMostRecentUrlsInDb = async (authorId: string): Promise<Array<string>> => {
  try {
    const recentResources = await ResourceModel
      .find({ author: authorId })
      .sort({ createdAt: -1 }) // Sort in descending order of createdAt
      .limit(20)
      .select('url'); // Select only the "url" field

    // Extract the URLs from the documents
    const urls = recentResources.map(resource => resource.url);

    return urls;
  } catch (error) {
    console.error('Error fetching recent URLs:', error);
    throw error;
  }
}

const syncResources = async () => {
  startDb(process.env.MONGO_URI);
  console.log("Syncing resources");

  // Get authors whose resources needs to be synced
  // Authors resources that need to be synced are authros with a last sync time of > 4 hours

  const hours: number = process.env.SYNC_HOURS ? Number(process.env.SYNC_HOURS) : 4; // the number of hours
  const timeLimit = new Date(Date.now() - hours * 60 * 60 * 1000); // the time limit

  console.log("Timelimit", timeLimit)

  try {
    const authorsToBeSynced = await AuthorModel.find({
      lastSynced: { $lt: timeLimit },
    }).exec();

    if (!authorsToBeSynced.length) {
      console.warn("No author to be synced, looks like things are up to date :)");
    }

    for (const author of authorsToBeSynced) {
      const recentUrls = await getMostRecentUrlsInDb(author._id);

      if (recentUrls) {
        await syncResourcesPublisher({
          authorId: author._id,
          service: (author.source as Sources),
          url: author.url,
          recentUrls
        });
      } else {
        console.error("Could not get recent urls for author: ", author._id);
      }
    }
  } catch (err) {
    console.error(
      "Could not fetch resources to be synced - syncResources.ts",
      err
    );
  }
};

await syncResources();

process.exit();