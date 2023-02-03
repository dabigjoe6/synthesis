import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import {
  subscribe,
  unsubscribe,
  getSubscriptions,
} from "../controllers/Resource.js";
import { Sources } from "../utils/constants.js";

const router = Router();

router.post("/medium", validate("resource"), subscribe(Sources.MEDIUM));
router.post("/substack", validate("resource"), subscribe(Sources.SUBSTACK));
router.post("/rss", validate("resource"), subscribe(Sources.RSS));

router.post("/unsubscribe", validate("unsubscribe"), unsubscribe);
router.post(
  "/getSubscriptions",
  validate("getSubscriptions"),
  getSubscriptions
);

export default router;
