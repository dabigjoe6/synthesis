import mongoose, { Schema, Document } from "mongoose";
import { Sources } from "../utils/constants";

export interface AuthorI extends Document {
  url: string;
  name?: string;
  source?: Sources; // TODO: Why is this not required
  lastSynced: number;
}
const authorSchema = new Schema({
  url: { type: String, required: true, unique: true },
  name: { type: String, required: false, unique: false },
  source: { type: String, required: false, unique: false }, // TODO: Why is this not required
  lastSynced: { type: Date, default: Date.now },
});

export default mongoose.model<AuthorI>("Author", authorSchema);
