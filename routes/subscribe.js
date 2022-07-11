import { Router } from 'express';
import { validate } from '../middleware/validators/index.js';
import mediumController from '../controllers/Medium.js';

const router = Router();

router.post('/medium', validate('medium'), mediumController);

export default router;