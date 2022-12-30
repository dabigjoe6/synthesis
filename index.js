import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { startDb } from "./src/config/database.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import routes from "./src/routes/index.js";

const app = express();

// load middlwares and Load environment variables from .env file
dotenv.config();

//start database
startDb();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const corsOptions = {
  origin: process.env.CLIENT_BASE_URL,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

//middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(urlencodedParser);

//routes
app.use("/", routes);

//Handling error
app.use(errorHandler);

const port = process.env.PORT || 3003;
app.listen(port, function () {
  console.log(`Server Listening on Port ${port}`);
});
