import mongoose from "mongoose";
import { Sources } from "../utils/constants.js";

export interface ResourceI extends mongoose.Document {
  url: string;
  author: mongoose.Schema.Types.ObjectId;
  title?: string;
  source?: Sources;
  description?: string;
  content?: string;
  summary?: string;
  lastSummaryUpdate?: Date;
  image?: string;
  authorsName?: string;
  datePublished?: Date;
  numberOfLikes?: number;
  numberOfComments?: number;
  latest: boolean;
  readLength?: string;
}

const resourceSchema = new mongoose.Schema<ResourceI>({
  url: { type: String, required: true, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, required: true, unique: false },
  title: { type: String, required: false, unique: false },
  source: { type: String, required: false, unique: false },
  description: { type: String, required: false, unique: false },
  content: { type: String, required: false, unique: false },
  summary: { type: String, required: false, unique: false, default: null },
  lastSummaryUpdate: { type: Date, required: false, unique: false },
  image: { type: String, required: false, unique: false },
  authorsName: { type: String, required: false, unique: false },
  datePublished: { type: Date, required: false, unique: false },
  numberOfLikes: { type: Number, required: false, unique: false },
  numberOfComments: { type: Number, required: false, unique: false },
  latest: { type: Boolean, required: true, unique: false },
});

export default mongoose.model<ResourceI>("Resource", resourceSchema);
