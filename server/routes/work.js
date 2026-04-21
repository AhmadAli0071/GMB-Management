import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import WorkSubmission from '../models/WorkSubmission.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../uploads');

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

function formatWork(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id,
    assignmentId: obj.assignmentId,
    projectId: obj.projectId,
    fromId: obj.fromId,
    toId: obj.toId,
    text: obj.text,
    files: obj.files,
    status: obj.status,
    reviewComment: obj.reviewComment,
    workDate: obj.workDate || '',
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

router.get('/', async (_req, res) => {
  try {
    const works = await WorkSubmission.find().sort({ createdAt: -1 });
    res.json(works.map(formatWork));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    const { assignmentId, projectId, toId, text, workDate } = req.body;
    const userId = req.user.id;
    const files = req.files?.map(f => ({ filename: f.filename, originalName: f.originalname })) || [];

    const workId = crypto.randomBytes(8).toString('hex');
    const work = await WorkSubmission.create({
      _id: workId,
      assignmentId,
      projectId,
      fromId: userId,
      toId,
      text: text || '',
      files,
      workDate: workDate || new Date().toISOString().split('T')[0],
    });

    logger.info('Work submitted', { component: 'work', workId, fromId: userId });
    res.json(formatWork(work));
  } catch (err) {
    logger.error('Work submit error', { component: 'work', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComment } = req.body;
    const updateData = { status };
    if (reviewComment) updateData.reviewComment = reviewComment;

    const work = await WorkSubmission.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
    if (!work) return res.status(404).json({ error: 'Work submission not found' });

    logger.info('Work reviewed', { component: 'work', workId: id, status });
    res.json(formatWork(work));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', upload.array('files', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const newFiles = req.files?.map(f => ({ filename: f.filename, originalName: f.originalname })) || [];

    const existing = await WorkSubmission.findById(id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const updateData = { status: 'PENDING_REVIEW', reviewComment: '' };
    if (text !== undefined) updateData.text = text;
    if (newFiles.length > 0) updateData.files = [...(existing.files || []), ...newFiles];

    const work = await WorkSubmission.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
    logger.info('Work updated', { component: 'work', workId: id });
    res.json(formatWork(work));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/file/:filename', async (req, res) => {
  try {
    const { id, filename } = req.params;
    const work = await WorkSubmission.findById(id);
    if (!work) return res.status(404).json({ error: 'Not found' });

    work.files = work.files.filter(f => f !== filename);
    await work.save();

    const fs = await import('fs');
    fs.default.unlink(`uploads/${filename}`, () => {});

    res.json(formatWork(work));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
