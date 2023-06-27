import { Router } from "express";

import authRouter from "./auth.js";
import subscribeRouter from "./subscribe.js";
import userRouter from './user.js';
import resourceRouter from './resource.js';
import metricsRouter from './metrics.js';

const routes = Router();

routes.use("/auth", authRouter);
routes.use("/subscribe", subscribeRouter);
routes.use('/user', userRouter);
routes.use('/resource', resourceRouter);
routes.use('/metrics', metricsRouter);

routes.get("/", (req, res, next) => {
  try {
    return res.json({
      message: "Welcome to Synthesis",
    });
  } catch (err) {
    next(err);
  }
});

export default routes;
