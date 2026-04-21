import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import ProjectUpdate from '../models/ProjectUpdate.js';
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

function formatUpdate(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id,
    projectId: obj.projectId,
    fromId: obj.fromId,
    toId: obj.toId,
    text: obj.text,
    files: obj.files,
    status: obj.status,
    reviewComment: obj.reviewComment,
    reportType: obj.reportType || 'SIMPLE',
    onPageText: obj.onPageText || '',
    onPageFiles: obj.onPageFiles || [],
    offPageWorkIds: obj.offPageWorkIds || [],
    onPageStatus: obj.onPageStatus || 'PENDING',
    offPageStatus: obj.offPageStatus || 'PENDING',
    onPageComment: obj.onPageComment || '',
    offPageComment: obj.offPageComment || '',
    workDate: obj.workDate || '',
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

router.get('/', async (_req, res) => {
  try {
    const updates = await ProjectUpdate.find().sort({ createdAt: -1 });
    res.json(updates.map(formatUpdate));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    const { projectId, toId, text, reportType, onPageText, offPageWorkIds, workDate } = req.body;
    const userId = req.user.id;
    const files = req.files?.map(f => ({ filename: f.filename, originalName: f.originalname })) || [];

    const isStructured = reportType === 'STRUCTURED';

    const updateId = crypto.randomBytes(8).toString('hex');
    const updateData = {
      _id: updateId,
      projectId,
      fromId: userId,
      toId,
      text: text || '',
      files,
      reportType: isStructured ? 'STRUCTURED' : 'SIMPLE',
      workDate: workDate || new Date().toISOString().split('T')[0],
    };

    if (isStructured) {
      updateData.onPageText = onPageText || '';
      updateData.files = [];
      updateData.text = '';
      try {
        const onPageFilesRaw = req.body.onPageFilesJson;
        if (onPageFilesRaw) {
          updateData.onPageFiles = JSON.parse(onPageFilesRaw);
        } else {
          updateData.onPageFiles = files;
        }
      } catch {
        updateData.onPageFiles = files;
      }
      if (offPageWorkIds) {
        try {
          updateData.offPageWorkIds = JSON.parse(offPageWorkIds);
        } catch {
          updateData.offPageWorkIds = Array.isArray(offPageWorkIds) ? offPageWorkIds : [];
        }
      }
    }

    const update = await ProjectUpdate.create(updateData);

    logger.info('Project update submitted', { component: 'updates', updateId, fromId: userId, toId, reportType: updateData.reportType });
    res.json(formatUpdate(update));
  } catch (err) {
    logger.error('Project update error', { component: 'updates', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComment } = req.body;
    const updateData = { status };
    if (reviewComment) updateData.reviewComment = reviewComment;

    const update = await ProjectUpdate.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
    if (!update) return res.status(404).json({ error: 'Not found' });

    logger.info('Project update reviewed', { component: 'updates', updateId: id, status });
    res.json(formatUpdate(update));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/review-section', async (req, res) => {
  try {
    const { id } = req.params;
    const { section, status, comment } = req.body;
    if (!['onPage', 'offPage'].includes(section) || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid section or status' });
    }

    const statusField = section === 'onPage' ? 'onPageStatus' : 'offPageStatus';
    const commentField = section === 'onPage' ? 'onPageComment' : 'offPageComment';
    const updateData = { [statusField]: status };
    if (comment) updateData[commentField] = comment;

    const update = await ProjectUpdate.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
    if (!update) return res.status(404).json({ error: 'Not found' });

    logger.info('Section reviewed', { component: 'updates', updateId: id, section, status });
    res.json(formatUpdate(update));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
