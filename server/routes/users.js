import { Router } from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    const result = {};
    for (const u of users) {
      result[u._id] = {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
      };
    }
    res.json(result);
  } catch (err) {
    logger.error('Get users error', { component: 'users', error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

export default router;
