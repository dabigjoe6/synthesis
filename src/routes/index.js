import { Router } from "express";

import subscribeRouter from "./subscribe.js";

const routes = Router();

routes.use("/subscribe", subscribeRouter);

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
