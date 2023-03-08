import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import { markSeenResources } from "../controllers/User.js";

const router = Router();

router.post("/mark-seen-resources", validate("markSeenResources"), markSeenResources);

export default router;
