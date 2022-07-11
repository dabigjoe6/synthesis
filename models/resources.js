import mongoose from "mongoose";
const Schema = mongoose.Schema;

const resourceSchema = new Schema({
  url: { type: String, required: true, unique: true },
  author: { type: Schema.ObjectId, required: true, unique: false },
  title: { type: String, required: false, unique: false },
  source: { type: String, required: false, unique: false },
  description: { type: String, required: false, unique: false },
  image: { type: String, required: false, unique: false },
});

export default mongoose.model("Resource", resourceSchema);
