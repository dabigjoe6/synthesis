import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import { subscribe } from "../controllers/Medium.js";
import { getSubscriptions, unsubscribe } from "../controllers/Subscription.js";

const router = Router();

router.post("/medium", validate("medium"), subscribe);
router.post("/unsubscribe", validate("unsubscribe"), unsubscribe);
router.post(
  "/getSubscriptions",
  validate("getSubscriptions"),
  getSubscriptions
);

export default router;
