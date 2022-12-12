import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import { subscribe as mediumSubscribe } from "../controllers/Medium.js";
import { subscribe as substackSubscribe } from "../controllers/Substack.js";
import { getSubscriptions, unsubscribe } from "../controllers/Subscription.js";

const router = Router();

router.post("/medium", validate("medium"), mediumSubscribe);
router.post("/substack", validate("substack"), substackSubscribe);
router.post("/unsubscribe", validate("unsubscribe"), unsubscribe);
router.post(
  "/getSubscriptions",
  validate("getSubscriptions"),
  getSubscriptions
);

export default router;
