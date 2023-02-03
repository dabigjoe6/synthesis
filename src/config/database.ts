import mongoose, { ConnectOptions } from "mongoose";


const MONGO_URI: string = process.env.MONGO_URI || '';

export const startDb = (uri:string = MONGO_URI) => {

  const connectOptions: ConnectOptions = {
    autoIndex: false
  }
 
  mongoose
    .connect(uri, connectOptions)
    .then(() => {
      console.log("Morningbrew Database has connected");
    })
    .catch((err) => {
      console.error(err);
      console.log("oops an error occurred");
      process.exit(1);
    });
};
