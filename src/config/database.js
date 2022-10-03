import mongoose from "mongoose";

export const startDb = (uri) => {
  if (!uri) {
    uri = process.env.MONGO_URI;
  }
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false
    })
    .then(() => {
      console.log("Morningbrew Database has connected");
    })
    .catch((err) => {
      console.error(err);
      console.log("oops an error occurred");
      process.exit(1);
    });
};
