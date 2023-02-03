import { Router } from "express";
import { verifyToken } from "../middleware/auth";

import authRouter from "./auth";
import subscribeRouter from "./subscribe";

const routes = Router();

routes.use("/auth", authRouter);
routes.use("/subscribe", verifyToken, subscribeRouter);

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
