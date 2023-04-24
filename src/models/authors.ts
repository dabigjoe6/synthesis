import mongoose from "mongoose";
import { Sources } from "../utils/constants.js";

export interface AuthorI extends mongoose.Document {
  url: string;
  name?: string;
  source: Sources;
  lastSynced: number;
}
const authorSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  name: { type: String, required: false, unique: false },
  source: { type: String, required: true, unique: false },
  lastSynced: { type: Date, default: Date.now },
});

export default mongoose.model<AuthorI>("Author", authorSchema);
