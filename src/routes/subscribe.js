import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import {
  subscribe,
  unsubscribe,
  getSubscriptions,
} from "../controllers/Resource.js";
import { sources } from "../utils/constants.js";

const router = Router();

router.post("/medium", validate("resource"), subscribe(sources.MEDIUM));
router.post("/substack", validate("resource"), subscribe(sources.SUBSTACK));
router.post("/rss", validate("resource"), subscribe(sources.RSS));

router.post("/unsubscribe", validate("unsubscribe"), unsubscribe);
router.post(
  "/getSubscriptions",
  validate("getSubscriptions"),
  getSubscriptions
);

export default router;
