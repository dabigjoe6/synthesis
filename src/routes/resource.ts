import { Router } from "express";
import { validate } from "../middleware/validators/index.js";
import { updateResources, syncAuthorsResources } from "../controllers/Resource/index.js";

const router = Router();

router.post("/update-resources", validate("updateResources"), updateResources);
router.post('/sync-resources', validate("syncResources"), syncAuthorsResources);

export default router;
