import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import { subscribe as mediumSubscribe } from "../controllers/Medium.js";
import { subscribe as substackSubscribe } from "../controllers/Substack.js";
import { subscribe as rssSubscribe } from '../controllers/RSS.js';
import { getSubscriptions, unsubscribe } from "../controllers/Subscription.js";

const router = Router();

router.post("/medium", validate("resource"), mediumSubscribe);
router.post("/substack", validate("resource"), substackSubscribe);
router.post("/rss", validate("resource"), rssSubscribe);

router.post("/unsubscribe", validate("unsubscribe"), unsubscribe);
router.post(
  "/getSubscriptions",
  validate("getSubscriptions"),
  getSubscriptions
);

export default router;
