import mongoose from "mongoose";

export const startDb = () => {
  //   console.log("encode", encodeURIComponent(process.env.DB_USER));
  const uri = process.env.MONGO_URI;
  mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
