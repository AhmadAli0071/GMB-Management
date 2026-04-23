import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import LeadWork from '../models/LeadWork.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');

const router = express.Router();
router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, crypto.randomBytes(8).toString('hex') + ext);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

function handleUpload(req, res, next) {
  upload.array('files', 10)(req, res, function (err) {
    if (err) {
      logger.error('Multer error in lead-work', { component: 'lead-work', error: err.message, code: err.code });
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    next();
  });
}

function formatLeadWork(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id,
    projectId: obj.projectId,
    userId: obj.userId,
    section: obj.section,
    text: obj.text,
    files: obj.files,
    status: obj.status,
    workDate: obj.workDate || '',
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

router.get('/', async (_req, res) => {
  try {
    const items = await LeadWork.find().sort({ createdAt: -1 });
    res.json(items.map(formatLeadWork));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', handleUpload, async (req, res) => {
  try {
    const { projectId, text, workDate } = req.body;
    const userId = req.user.id;
    const files = req.files?.map(f => ({ filename: f.filename, originalName: f.originalname })) || [];

    const itemId = crypto.randomBytes(8).toString('hex');
    const item = await LeadWork.create({
      _id: itemId,
      projectId,
      userId,
      section: 'ON_PAGE',
      text: text || '',
      files,
      workDate: workDate || new Date().toISOString().split('T')[0],
    });

    logger.info('Lead work created', { component: 'lead-work', itemId, userId });
    res.json(formatLeadWork(item));
  } catch (err) {
    logger.error('Lead work create error', { component: 'lead-work', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', handleUpload, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const newFiles = req.files?.map(f => ({ filename: f.filename, originalName: f.originalname })) || [];

    const existing = await LeadWork.findById(id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const updateData = {};
    if (text !== undefined) updateData.text = text;
    if (newFiles.length > 0) updateData.files = [...(existing.files || []), ...newFiles];

    const item = await LeadWork.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
    logger.info('Lead work updated', { component: 'lead-work', itemId: id });
    res.json(formatLeadWork(item));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/file/:filename', async (req, res) => {
  try {
    const { id, filename } = req.params;
    const item = await LeadWork.findById(id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    item.files = item.files.filter(f => f.filename !== filename);
    await item.save();

    const fs = await import('fs');
    fs.default.unlink(path.join(uploadsDir, filename), () => {});

    res.json(formatLeadWork(item));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LeadWork.findById(id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    for (const f of item.files) {
      const fs = await import('fs');
      fs.default.unlink(path.join(uploadsDir, f.filename), () => {});
    }

    await LeadWork.findByIdAndDelete(id);
    logger.info('Lead work deleted', { component: 'lead-work', itemId: id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
