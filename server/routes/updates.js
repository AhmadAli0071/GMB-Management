import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import ProjectUpdate from '../models/ProjectUpdate.js';
import User from '../models/User.js';
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

function formatUpdate(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id,
    projectId: obj.projectId,
    fromId: obj.fromId,
    toId: obj.toId,
    title: obj.title || '',
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
    const { projectId, toId, text, title, reportType, onPageText, offPageWorkIds, workDate } = req.body;
    const userId = req.user.id;

    if (!toId) {
      return res.status(400).json({ error: 'Recipient (toId) is required' });
    }

    const files = req.files?.map(f => ({ filename: f.filename, originalName: f.originalname })) || [];

    const isStructured = reportType === 'STRUCTURED';

    const updateId = crypto.randomBytes(8).toString('hex');
    const updateData = {
      _id: updateId,
      projectId,
      fromId: userId,
      toId,
      title: title || '',
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

    const io = req.app.get('io');
    if (io) {
      io.emit('data-changed', { type: 'REPORT_SUBMITTED', projectId, userId });
      io.to(`user:${toId}`).emit('activity-notification', { type: 'REPORT_SUBMITTED', message: 'A new report has been submitted', projectId, fromUserId: userId });
    }

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

    const io = req.app.get('io');
    if (io) {
      io.emit('data-changed', { type: 'REPORT_REVIEWED', projectId: update.projectId, userId: req.user.id });
      io.to(`user:${update.fromId}`).emit('activity-notification', { type: 'REPORT_REVIEWED', message: `Your report has been ${status === 'APPROVED' ? 'approved' : 'rejected'}`, projectId: update.projectId, fromUserId: req.user.id });
    }

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

    let update = await ProjectUpdate.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
    if (!update) return res.status(404).json({ error: 'Not found' });

    const hasOnPage = !!(update.onPageText || (update.onPageFiles && update.onPageFiles.length > 0));
    const hasOffPage = !!(update.offPageWorkIds && update.offPageWorkIds.length > 0);

    let allResolved = true;
    let allApproved = true;

    if (hasOnPage) {
      if (update.onPageStatus === 'PENDING') allResolved = false;
      if (update.onPageStatus !== 'APPROVED') allApproved = false;
    }
    if (hasOffPage) {
      if (update.offPageStatus === 'PENDING') allResolved = false;
      if (update.offPageStatus !== 'APPROVED') allApproved = false;
    }

    if (allResolved && (hasOnPage || hasOffPage)) {
      update = await ProjectUpdate.findByIdAndUpdate(
        id,
        { status: allApproved ? 'APPROVED' : 'CHANGES_REQUESTED' },
        { returnDocument: 'after' }
      );
    }

    logger.info('Section reviewed', { component: 'updates', updateId: id, section, status });

    const io = req.app.get('io');
    if (io) {
      io.emit('data-changed', { type: 'SECTION_REVIEWED', projectId: update.projectId, userId: req.user.id });
      io.to(`user:${update.fromId}`).emit('activity-notification', { type: 'SECTION_REVIEWED', message: `Your ${section === 'onPage' ? 'On-Page' : 'Off-Page'} report has been ${status === 'APPROVED' ? 'approved' : 'rejected'}`, projectId: update.projectId, fromUserId: req.user.id });
    }

    res.json(formatUpdate(update));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit report to both SEO Manager (Ali) and Sales Manager (Kevin)
router.post('/submit-to-managers', upload.array('files', 10), async (req, res) => {
  try {
    const { projectId, title, text, workDate } = req.body;
    const fromId = req.user.id;
    const files = req.files?.map(f => ({ filename: f.filename, originalName: f.originalname })) || [];

    // Find SEO Manager (Ali) and Sales Manager (Kevin)
    const [seoManager, salesManager] = await Promise.all([
      User.findOne({ role: 'SEO_MANAGER' }),
      User.findOne({ role: 'SALES_MANAGER' })
    ]);

    if (!seoManager || !salesManager) {
      return res.status(400).json({ error: 'Required managers (SEO, Sales) not found in system' });
    }

    const managers = [seoManager._id, salesManager._id];
    const reports = [];

    for (const toId of managers) {
      const updateId = crypto.randomBytes(8).toString('hex');
      const updateData = {
        _id: updateId,
        projectId,
        fromId,
        toId,
        title: title || '',
        text: text || '',
        files,
        status: 'PENDING_REVIEW',
        reportType: 'SIMPLE',
        workDate: workDate || new Date().toISOString().split('T')[0],
      };

      const update = await ProjectUpdate.create(updateData);
      reports.push(update);

      const io = req.app.get('io');
      if (io) {
        io.to(`user:${toId}`).emit('activity-notification', {
          type: 'REPORT_SUBMITTED',
          message: `New report submitted: ${title || 'Report'}`,
          projectId,
          fromUserId: fromId
        });
      }
    }

    logger.info('Reports submitted to managers', { component: 'updates', fromId, projectId, reportCount: reports.length });

    res.status(201).json({ reports: reports.map(formatUpdate) });
  } catch (err) {
    logger.error('Submit to managers error', { component: 'updates', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

export default router;
