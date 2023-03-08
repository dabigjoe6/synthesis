import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import { updateResourceSummary, syncAuthorsResources } from "../controllers/Resource.js";

const router = Router();

router.post("/update-resource-summary", validate("updateResourceSummary"), updateResourceSummary);
router.post('/sync-resources', validate("syncResources"), syncAuthorsResources);

export default router;
