import mongoose from "mongoose";
const Schema = mongoose.Schema;

const authorSchema = new Schema({
  url: { type: String, required: true, unique: true },
  name: { type: String, required: false, unique: false },
  source: { type: String, required: false, unique: false },
});

export default mongoose.model("Author", authorSchema);
