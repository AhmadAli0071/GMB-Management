import { Router } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Chat from '../models/Chat.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsBase = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');

function getConvId(u1, u2, projectId) {
  return [u1, u2].sort().join('_dm_') + '_' + projectId;
}

const storage = multer.diskStorage({
  destination: path.join(uploadsBase, 'chat'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|txt|xlsx|xls|mp3|wav|ogg|webm)$/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  },
});

const router = Router();
router.use(authMiddleware);

// ===== DM (Project-Specific Private Chat) Routes =====

router.get('/dm/:projectId/:targetUserId', async (req, res) => {
  try {
    const { projectId, targetUserId } = req.params;
    const userId = req.user.id;
    const conversationId = getConvId(userId, targetUserId, projectId);
    const { limit = 50, before } = req.query;

    const filter = { conversationId, hiddenBy: { $ne: userId } };
    if (before) filter.createdAt = { $lt: new Date(before) };

    const messages = await Chat.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(messages.reverse());
  } catch (err) {
    logger.error('Get DM messages error', { component: 'chat', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.post('/dm/:projectId/:targetUserId', async (req, res) => {
  try {
    const { projectId, targetUserId } = req.params;
    const userId = req.user.id;
    const conversationId = getConvId(userId, targetUserId, projectId);
    const { text, type = 'TEXT' } = req.body;

    const msg = new Chat({
      _id: crypto.randomBytes(8).toString('hex'),
      conversationId,
      projectId,
      senderId: userId,
      text: text || '',
      type,
    });

    await msg.save();
    const populated = await Chat.findById(msg._id);

    const io = req.app.get('io');
    if (io) {
      const msgData = { ...populated.toObject(), _id: populated._id };
      io.to(`dm:${conversationId}`).emit('dm-new-message', msgData);
      io.to(`user:${targetUserId}`).emit('dm-notification', msgData);
    }

    res.json(populated);
  } catch (err) {
    logger.error('Send DM error', { component: 'chat', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.post('/dm/:projectId/:targetUserId/upload', upload.single('file'), async (req, res) => {
  try {
    const { projectId, targetUserId } = req.params;
    const userId = req.user.id;
    const conversationId = getConvId(userId, targetUserId, projectId);
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const isVoice = /\.(mp3|wav|ogg|webm)$/i.test(file.originalname);
    const msg = new Chat({
      _id: crypto.randomBytes(8).toString('hex'),
      conversationId,
      projectId,
      senderId: userId,
      text: req.body.text || '',
      type: isVoice ? 'VOICE' : 'FILE',
      fileUrl: isVoice ? '' : file.filename,
      fileName: isVoice ? '' : file.originalname,
      fileType: isVoice ? '' : file.mimetype,
      voiceUrl: isVoice ? file.filename : '',
      voiceDuration: req.body.duration ? Number(req.body.duration) : 0,
    });

    await msg.save();
    const populated = await Chat.findById(msg._id);

    const io = req.app.get('io');
    if (io) {
      const msgData = { ...populated.toObject(), _id: populated._id };
      io.to(`dm:${conversationId}`).emit('dm-new-message', msgData);
      io.to(`user:${targetUserId}`).emit('dm-notification', msgData);
    }

    res.json(populated);
  } catch (err) {
    logger.error('DM upload error', { component: 'chat', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.put('/dm/:projectId/:targetUserId/message/:messageId', async (req, res) => {
  try {
    const { projectId, targetUserId, messageId } = req.params;
    const userId = req.user.id;
    const { text } = req.body;

    if (!text || !text.trim()) return res.status(400).json({ error: 'Text is required' });

    const conversationId = getConvId(userId, targetUserId, projectId);
    const msg = await Chat.findById(messageId);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.senderId !== userId) return res.status(403).json({ error: 'Not your message' });
    if (msg.type !== 'TEXT') return res.status(400).json({ error: 'Only text messages can be edited' });

    msg.text = text.trim();
    msg.edited = true;
    await msg.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`dm:${conversationId}`).emit('dm-message-edited', {
        conversationId, projectId, messageId, text: msg.text, edited: true,
      });
    }

    res.json(msg);
  } catch (err) {
    logger.error('Edit DM error', { component: 'chat', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/dm/:projectId/:targetUserId/message/:messageId', async (req, res) => {
  try {
    const { projectId, targetUserId, messageId } = req.params;
    const userId = req.user.id;
    const conversationId = getConvId(userId, targetUserId, projectId);

    const msg = await Chat.findById(messageId);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.senderId !== userId) return res.status(403).json({ error: 'Not your message' });

    msg.deleted = true;
    msg.type = 'TEXT';
    msg.text = '';
    msg.fileUrl = '';
    msg.fileName = '';
    msg.fileType = '';
    msg.voiceUrl = '';
    msg.voiceDuration = 0;
    await msg.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`dm:${conversationId}`).emit('dm-message-deleted', {
        conversationId, projectId, messageId, deletedBy: userId,
      });
    }

    res.json({ success: true });
  } catch (err) {
    logger.error('Delete DM error', { component: 'chat', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.post('/dm/:projectId/:targetUserId/message/:messageId/hide', async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const msg = await Chat.findById(messageId);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    if (!msg.hiddenBy.includes(userId)) {
      msg.hiddenBy.push(userId);
      await msg.save();
    }

    res.json({ success: true });
  } catch (err) {
    logger.error('Hide DM error', { component: 'chat', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/dm/clear/:projectId/:targetUserId', async (req, res) => {
  try {
    const { projectId, targetUserId } = req.params;
    const userId = req.user.id;
    const conversationId = getConvId(userId, targetUserId, projectId);

    await Chat.updateMany(
      { conversationId, hiddenBy: { $ne: userId } },
      { $push: { hiddenBy: userId } }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`dm:${conversationId}`).emit('dm-chat-cleared', { conversationId, projectId, userId });
    }

    res.json({ success: true });
  } catch (err) {
    logger.error('Clear DM error', { component: 'chat', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// ===== Project Chat Routes (existing) =====

router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, before } = req.query;
    const userId = req.user.id;

    const filter = { projectId, conversationId: { $in: ['', null] }, hiddenBy: { $ne: userId } };
    if (before) filter.createdAt = { $lt: new Date(before) };

    const messages = await Chat.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(messages.reverse());
  } catch (err) {
    logger.error('Get chat messages error', { component: 'chat', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.post('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { text, type = 'TEXT' } = req.body;

    const msg = new Chat({
      _id: crypto.randomBytes(8).toString('hex'),
      projectId,
      senderId: userId,
      text: text || '',
      type,
    });

    await msg.save();
    const populated = await Chat.findById(msg._id);

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('new-message', {
        ...populated.toObject(),
        _id: populated._id,
      });
    }

    res.json(populated);
  } catch (err) {
    logger.error('Send chat message error', { component: 'chat', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.post('/:projectId/upload', upload.single('file'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const isVoice = /\.(mp3|wav|ogg|webm)$/i.test(file.originalname);
    const msg = new Chat({
      _id: crypto.randomBytes(8).toString('hex'),
      projectId,
      senderId: userId,
      text: req.body.text || '',
      type: isVoice ? 'VOICE' : 'FILE',
      fileUrl: isVoice ? '' : file.filename,
      fileName: isVoice ? '' : file.originalname,
      fileType: isVoice ? '' : file.mimetype,
      voiceUrl: isVoice ? file.filename : '',
      voiceDuration: req.body.duration ? Number(req.body.duration) : 0,
    });

    await msg.save();
    const populated = await Chat.findById(msg._id);

    const io = req.app.get('io');
    if (io) {
      io.to(`project:${projectId}`).emit('new-message', {
        ...populated.toObject(),
        _id: populated._id,
      });
    }

    res.json(populated);
  } catch (err) {
    logger.error('Chat file upload error', { component: 'chat', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

export default router;
