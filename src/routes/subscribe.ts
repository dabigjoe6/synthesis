import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import {
  subscribe,
  unsubscribe,
  getSubscriptions,
  saveAuthorsPosts,
} from "../controllers/Resource/index.js";
import { Sources } from "../utils/constants.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.post("/medium", verifyToken, validate("resource"), subscribe(Sources.MEDIUM));
router.post("/substack", verifyToken, validate("resource"), subscribe(Sources.SUBSTACK));
router.post("/rss", verifyToken, validate("resource"), subscribe(Sources.RSS));

router.post("/unsubscribe", verifyToken, validate("unsubscribe"), unsubscribe);

router.post(
  "/getSubscriptions",
  verifyToken,
  validate("getSubscriptions"),
  getSubscriptions
);

router.post('/saveAuthorsPosts', validate('saveAuthorsPosts'), saveAuthorsPosts);

export default router;
