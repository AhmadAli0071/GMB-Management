import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'crossdigi-secret-2024';

router.post('/register', async (req, res) => {
  try {
    const { id, name, email, password, role } = req.body;
    if (!id || !name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields required: id, name, email, password, role' });
    }

    const existing = await User.findOne({ $or: [{ _id: id }, { email }] });
    if (existing) {
      return res.status(409).json({ error: 'User with this id or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ _id: id, name, email, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    logger.info('User registered', { component: 'auth', userId: user._id, role: user.role });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    logger.error('Registration error', { component: 'auth', error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    logger.info('Login attempt', { component: 'auth', email });

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Login failed - user not found', { component: 'auth', email });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logger.warn('Login failed - invalid password', { component: 'auth', email, userId: user.id });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    logger.info('Login successful', { component: 'auth', userId: user._id, role: user.role });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    logger.error('Login error', { component: 'auth', error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

export default router;
