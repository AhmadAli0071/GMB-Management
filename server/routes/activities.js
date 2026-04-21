import { Router } from 'express';
import crypto from 'crypto';
import Activity from '../models/Activity.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.use(authMiddleware);

function formatActivity(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id,
    type: obj.type,
    userId: obj.userId,
    projectId: obj.projectId,
    taskId: obj.taskId,
    content: obj.content,
    timestamp: obj.timestamp,
  };
}

router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ timestamp: -1 }).limit(100);
    res.json(activities.map(formatActivity));
  } catch (err) {
    logger.error('Get activities error', { component: 'activities', error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

router.post('/update', async (req, res) => {
  try {
    const { projectId, content } = req.body;
    const userId = req.user.id;

    if (!projectId || !content) {
      return res.status(400).json({ error: 'projectId and content required' });
    }

    const activityId = crypto.randomBytes(8).toString('hex');
    const activity = await Activity.create({
      _id: activityId,
      type: 'UPDATE_SENT',
      userId,
      projectId,
      content,
      timestamp: new Date(),
    });

    logger.info('Update sent', { component: 'activities', projectId, userId });

    res.status(201).json(formatActivity(activity));
  } catch (err) {
    logger.error('Send update error', { component: 'activities', error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

export default router;
