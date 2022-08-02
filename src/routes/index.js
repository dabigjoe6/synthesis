import { Router } from "express";

import subscribeRouter from "./subscribe.js";

import { sendEmails } from '../controllers/Emails.js';

const routes = Router();

routes.use("/subscribe", subscribeRouter);

//TODO: Add validation
routes.post("/sendEmails", sendEmails);

routes.get("/", (req, res, next) => {
  try {
    return res.json({
      message: "Welcome to MorningBrew",
    });
  } catch (err) {
    next(err);
  }
});


export default routes;