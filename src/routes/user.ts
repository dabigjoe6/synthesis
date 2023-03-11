import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import { markSeenResources, pauseDigest, resumeDigest } from "../controllers/User.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.post("/mark-seen-resources", validate("markSeenResources"), markSeenResources);
router.post('/pause-digest', verifyToken, validate('pauseDigest'), pauseDigest);
router.post('/resume-digest', verifyToken, validate('resumeDigest'), resumeDigest);

export default router;
