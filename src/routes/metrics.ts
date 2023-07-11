import { Router } from 'express';
import { validate } from '../middleware/validators/index.js';
import {
  numberOfUsers,
  numberOfEmailsSent,
  numberOfUsersWithSummaries,
  numberOfPausedDigests,
  numberOfSubscriptions,
  averageNumberOfSubscriptions,
  topSubscriptions,
  allMetrics
} from '../controllers/Metrics.js';

const router = Router();

router.get('/no-of-users', numberOfUsers);
router.get('/no-of-users-with-summaries', numberOfUsersWithSummaries);
router.get('/no-of-paused-digest', numberOfPausedDigests);
router.get('/no-of-subscriptions', numberOfSubscriptions);
router.get('/average-no-of-subscriptions', averageNumberOfSubscriptions);
router.get('/top-subscriptions', topSubscriptions)
router.get('/no-of-emails-sent', validate("numberOfEmailsSent"), numberOfEmailsSent);
router.get('', allMetrics);

export default router;