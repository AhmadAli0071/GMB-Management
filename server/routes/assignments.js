import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import Assignment from '../models/Assignment.js';
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

function formatAssignment(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id,
    projectId: obj.projectId,
    fromId: obj.fromId,
    toId: obj.toId,
    text: obj.text,
    images: obj.images,
    documents: obj.documents,
    status: obj.status,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

router.get('/', async (_req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json(assignments.map(formatAssignment));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', upload.fields([{ name: 'images', maxCount: 5 }, { name: 'documents', maxCount: 5 }]), async (req, res) => {
  try {
    const { projectId, toId, text } = req.body;
    const userId = req.user.id;

    const images = req.files?.images?.map(f => ({ filename: f.filename, originalName: f.originalname })) || [];
    const documents = req.files?.documents?.map(f => ({ filename: f.filename, originalName: f.originalname })) || [];

    const assignmentId = crypto.randomBytes(8).toString('hex');
    const assignment = await Assignment.create({
      _id: assignmentId,
      projectId,
      fromId: userId,
      toId,
      text: text || '',
      images,
      documents,
    });

    logger.info('Assignment created', { component: 'assignments', assignmentId, fromId: userId, toId });
    res.json(formatAssignment(assignment));
  } catch (err) {
    logger.error('Create assignment error', { component: 'assignments', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const assignment = await Assignment.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(formatAssignment(assignment));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
