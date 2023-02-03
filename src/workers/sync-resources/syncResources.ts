import dotenv from "dotenv";
import { startDb } from "../../config/database.js";
import AuthorModel from "../../models/authors.js";
import syncResourcesPublisher from "./syncResourcesPublisher.js";
import { fileURLToPath } from "url";
import path from "path";
import { Sources } from "../../utils/constants.js";

const __filename = fileURLToPath(import.meta.url);

dotenv.config({ path: path.resolve(__filename, "../../../../.env") });

const syncResources = async () => {
  startDb(process.env.MONGO_URI);
  console.log("Syncing resources");

  // Get authors whose resources needs to be synced
  // TODO: Determine whats the best time for last synced (24 hours?)
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

    authorsToBeSynced.forEach((author) => {
      syncResourcesPublisher({
        authorId: author._id,
        service: (author.source as Sources),
        url: author.url,
      });
    });
  } catch (err) {
    console.error(
      "Could not fetch resources to be synced - syncResources.ts",
      err
    );
  }
};

syncResources();
