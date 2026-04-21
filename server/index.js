import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import activityRoutes from './routes/activities.js';
import userRoutes from './routes/users.js';
import assignmentRoutes from './routes/assignments.js';
import workRoutes from './routes/work.js';
import updateRoutes from './routes/updates.js';
import leadWorkRoutes from './routes/lead-work.js';
import chatRoutes from './routes/chat.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

dotenv.config({ path: '../.env' });

const JWT_SECRET = process.env.JWT_SECRET || 'crossdigi-secret-2024';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.set('io', io);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/work', workRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/lead-work', leadWorkRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use(notFoundHandler);
app.use(errorHandler);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.data.userId = decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.data.userId;
  socket.join(`user:${userId}`);

  logger.info('Socket connected', { component: 'socket', socketId: socket.id, userId });

  socket.on('join-project', (projectId) => {
    socket.join(`project:${projectId}`);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on('send-message', (data) => {
    io.to(`project:${data.projectId}`).emit('new-message', data);
  });

  socket.on('join-dm', (conversationId) => {
    socket.join(`dm:${conversationId}`);
  });

  socket.on('leave-dm', (conversationId) => {
    socket.leave(`dm:${conversationId}`);
  });

  socket.on('disconnect', () => {
    logger.info('Socket disconnected', { component: 'socket', socketId: socket.id, userId });
  });
});

async function start() {
  try {
    await connectDB();
    const collections = ['users', 'activities', 'projects', 'tasks', 'inforequests', 'leadworks'];
    for (const col of collections) {
      try {
        await mongoose.connection.collection(col).dropIndex('id_1');
      } catch (e) {}
    }
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      logger.info(`Server started on http://localhost:${PORT}`, { component: 'server', port: PORT });
    });
  } catch (err) {
    logger.error('Failed to start server', { component: 'server', error: err.message });
    process.exit(1);
  }
}

start();
