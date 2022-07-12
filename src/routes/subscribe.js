import { Router } from 'express';
import { validate } from '../middleware/validators/index.js';
import { subscribe } from '../controllers/Medium.js';

const router = Router();

router.post('/medium', validate('medium'), subscribe);

export default router;