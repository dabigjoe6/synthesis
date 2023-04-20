import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import { updateResourceSummaryAndReadLength, syncAuthorsResources } from "../controllers/Resource.js";

const router = Router();

router.post("/update-resource-summary-and-read-length", validate("updateResourceSummaryAndReadLength"), updateResourceSummaryAndReadLength);
router.post('/sync-resources', validate("syncResources"), syncAuthorsResources);

export default router;
