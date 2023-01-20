import mongoose from "mongoose";
const Schema = mongoose.Schema;

const resourceSchema = new Schema({
  url: { type: String, required: true, unique: false },
  author: { type: Schema.ObjectId, required: true, unique: false },
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

export default mongoose.model("Resource", resourceSchema);
