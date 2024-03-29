import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import {
  markSeenResources,
  pauseDigest,
  resumeDigest,
  setDigestFrequency,
  enableSummary,
  disableSummary,
  userDetails
} from "../controllers/User/index.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.post("/mark-seen-resources", validate("markSeenResources"), markSeenResources);

router.post('/details', verifyToken, validate('details'), userDetails);
router.post('/pause-digest', verifyToken, validate('pauseDigest'), pauseDigest);
router.post('/resume-digest', verifyToken, validate('resumeDigest'), resumeDigest);
router.post('/enable-summary', verifyToken, validate('enableSummary'), enableSummary);
router.post('/disable-summary', verifyToken, validate('disableSummary'), disableSummary);
router.post('/set-frequency', verifyToken, validate('setDigestFrequency'), setDigestFrequency);

export default router;
