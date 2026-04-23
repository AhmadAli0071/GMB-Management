import { Router } from 'express';
import crypto from 'crypto';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.use(authMiddleware);

function formatProject(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id,
    name: obj.name,
    businessCategory: obj.businessCategory,
    businessAddress: obj.businessAddress,
    businessCity: obj.businessCity,
    businessState: obj.businessState,
    businessZip: obj.businessZip,
    businessPhone: obj.businessPhone,
    businessEmail: obj.businessEmail,
    businessWebsite: obj.businessWebsite,
    googleMapsLink: obj.googleMapsLink,
    yelpLink: obj.yelpLink || '',
    homeAdvisorLink: obj.homeAdvisorLink || '',
    verificationStatus: obj.verificationStatus,
    targetKeywords: obj.targetKeywords,
    competitors: obj.competitors,
    businessHours: obj.businessHours,
    services: obj.services,
    offerServices: obj.offerServices || '',
    serviceAreas: obj.serviceAreas,
    currentReviews: obj.currentReviews,
    currentRating: obj.currentRating,
    specialInstructions: obj.specialInstructions,
    managerComment: obj.managerComment,
    stage: obj.stage,
    assignedTo: obj.assignedTo,
    createdBy: obj.createdBy,
    lastUpdate: obj.lastUpdate,
    createdAt: obj.createdAt,
  };
}

router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const data = req.body;

    if (!data.name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const projectId = crypto.randomBytes(8).toString('hex');

    const project = new Project({
      _id: projectId,
      name: data.name,
      businessCategory: data.businessCategory || '',
      businessAddress: data.businessAddress || '',
      businessCity: data.businessCity || '',
      businessState: data.businessState || '',
      businessZip: data.businessZip || '',
      businessPhone: data.businessPhone || '',
      businessEmail: data.businessEmail || '',
      businessWebsite: data.businessWebsite || '',
      googleMapsLink: data.googleMapsLink || '',
      yelpLink: data.yelpLink || '',
      homeAdvisorLink: data.homeAdvisorLink || '',
      verificationStatus: data.verificationStatus || 'UNVERIFIED',
      targetKeywords: data.targetKeywords || '',
      competitors: data.competitors || '',
      businessHours: data.businessHours || '',
      services: data.services || '',
      offerServices: data.offerServices || '',
      serviceAreas: data.serviceAreas || '',
      currentReviews: data.currentReviews || 0,
      currentRating: data.currentRating || 0,
      specialInstructions: data.specialInstructions || '',
      stage: 'CLIENT_COMMUNICATION',
      assignedTo: [],
      createdBy: userId,
      lastUpdate: new Date(),
    });

    await project.save();

    const activityId = crypto.randomBytes(8).toString('hex');
    await Activity.create({
      _id: activityId,
      type: 'PROJECT_CREATED',
      userId,
      projectId,
      content: 'created a new GMB project',
      timestamp: new Date(),
    });

    logger.info('Project created', { component: 'projects', projectId, userId });

    const io = req.app.get('io');
    if (io) io.emit('data-changed', { type: 'PROJECT_CREATED', projectId, userId });

    res.status(201).json(formatProject(project));
  } catch (err) {
    logger.error('Create project error', { component: 'projects', error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects.map(formatProject));
  } catch (err) {
    logger.error('Get projects error', { component: 'projects', error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const data = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.createdBy !== userId) return res.status(403).json({ error: 'Not authorized to edit this project' });

    const updatableFields = [
      'name', 'businessCategory', 'businessAddress', 'businessCity',
      'businessState', 'businessZip', 'businessPhone', 'businessEmail', 'businessWebsite',
      'googleMapsLink', 'yelpLink', 'homeAdvisorLink', 'verificationStatus', 'targetKeywords', 'competitors', 'businessHours',
      'services', 'offerServices', 'serviceAreas', 'currentReviews', 'currentRating', 'specialInstructions',
    ];

    updatableFields.forEach(field => {
      if (data[field] !== undefined) project[field] = data[field];
    });
    project.lastUpdate = new Date();

    await project.save();

    const activityId = crypto.randomBytes(8).toString('hex');
    await Activity.create({
      _id: activityId,
      type: 'PROJECT_UPDATED',
      userId,
      projectId: id,
      content: 'updated project details',
      timestamp: new Date(),
    });

    logger.info('Project updated', { component: 'projects', projectId: id, userId });

    res.json(formatProject(project));
  } catch (err) {
    logger.error('Update project error', { component: 'projects', error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/stage', async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const userId = req.user.id;

    const project = await Project.findByIdAndUpdate(
      id,
      { stage, lastUpdate: new Date() },
      { returnDocument: 'after' }
    );

    if (!project) return res.status(404).json({ error: 'Project not found' });

    const activityId = crypto.randomBytes(8).toString('hex');
    await Activity.create({
      _id: activityId,
      type: 'STAGE_CHANGED',
      userId,
      projectId: id,
      content: `moved project to ${stage.replace(/_/g, ' ').toLowerCase()}`,
      timestamp: new Date(),
    });

    logger.info('Project stage updated', { component: 'projects', projectId: id, stage, userId });

    const io = req.app.get('io');
    if (io) io.emit('data-changed', { type: 'STAGE_CHANGED', projectId: id, userId });

    res.json(formatProject(project));
  } catch (err) {
    logger.error('Update stage error', { component: 'projects', error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { leadId, comment } = req.body;
    const userId = req.user.id;

    const updateData = {
      assignedTo: [leadId],
      stage: 'ASSIGNED_TO_LEAD',
      lastUpdate: new Date(),
    };
    if (comment) updateData.managerComment = comment;

    const project = await Project.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after' }
    );

    if (!project) return res.status(404).json({ error: 'Project not found' });

    const activityId = crypto.randomBytes(8).toString('hex');
    await Activity.create({
      _id: activityId,
      type: 'STAGE_CHANGED',
      userId,
      projectId: id,
      content: `assigned project to SEO Lead`,
      timestamp: new Date(),
    });

    logger.info('Project assigned', { component: 'projects', projectId: id, leadId, userId });

    const io = req.app.get('io');
    if (io) {
      io.emit('data-changed', { type: 'PROJECT_ASSIGNED', projectId: id, userId });
      io.to(`user:${leadId}`).emit('activity-notification', { type: 'PROJECT_ASSIGNED', message: 'A new project has been assigned to you', projectId: id, fromUserId: userId });
    }

    res.json(formatProject(project));
  } catch (err) {
    logger.error('Assign project error', { component: 'projects', error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== 'BOSS') {
      return res.status(403).json({ error: 'Only Boss can delete projects' });
    }

    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const mongoose = (await import('mongoose')).default;
    const db = mongoose.connection.db;
    await db.collection('assignments').deleteMany({ projectId: id });
    await db.collection('worksubmissions').deleteMany({ projectId: id });
    await db.collection('projectupdates').deleteMany({ projectId: id });
    await db.collection('leadworks').deleteMany({ projectId: id });
    await db.collection('activities').deleteMany({ projectId: id });

    logger.info('Project deleted', { component: 'projects', projectId: id, userId });

    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    logger.error('Delete project error', { component: 'projects', error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

export default router;
