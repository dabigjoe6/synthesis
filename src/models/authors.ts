import mongoose from "mongoose";
import { Sources } from "../utils/constants.js";

export interface AuthorI extends mongoose.Document {
  url: string;
  name?: string;
  source?: Sources; // TODO: Why is this not required
  lastSynced: number;
}
const authorSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  name: { type: String, required: false, unique: false },
  source: { type: String, required: false, unique: false }, // TODO: Why is this not required
  lastSynced: { type: Date, default: Date.now },
});

export default mongoose.model<AuthorI>("Author", authorSchema);
