import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

dotenv.config({ path: path.resolve(__filename, "../../../.env") });

const MONGO_URI: string = process.env.MONGO_URI || '';

export const startDb = async (uri: string = MONGO_URI) => {
  try {

    const connectOptions: mongoose.ConnectOptions = {
      autoIndex: true
    }

    await mongoose.connect(uri, connectOptions)
    console.log("Synthesis Database has connected");

  } catch (err) {
    console.error(err);
    console.log("oops an error occurred");
    process.exit(1);
  }
}   
