import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import { updateResourceSummary } from "../controllers/Resource.js";

const router = Router();

router.post("/update-resource-summary", validate("updateResourceSummary"), updateResourceSummary);

export default router;
