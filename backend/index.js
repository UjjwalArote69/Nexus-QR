import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

import { connectDB, sequelize } from './config/db.js';
import logger from './config/logger.js';
import requestLogger from './middleware/requestLogger.middleware.js';
import errorHandler from './middleware/errorHandler.middleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Import Routes & Controllers
import userRoute from './routes/user.route.js';
import qrRoute from './routes/qrcode.route.js';
import analyticsRoute from './routes/analytics.route.js';
import templateRoute from './routes/template.route.js';
import folderRoute from './routes/folder.route.js';
import { redirectQR } from './controllers/qrcode.controller.js';

// Import Models so Sequelize knows to create the tables
import Folder from './models/folder.model.js';
import QRCode from './models/qrcode.model.js';
import './models/scanEvent.model.js';
import './models/template.model.js';

// Setup Folder <-> QRCode relationship (both models are loaded now, no circular dep)
Folder.hasMany(QRCode, { foreignKey: 'folderId', as: 'qrcodes', constraints: false });
QRCode.belongsTo(Folder, { foreignKey: 'folderId', as: 'folder', constraints: false });

// Validate JWT secret on startup
const UNSAFE_SECRETS = ['your_super_secret_key_here', 'CHANGE_ME_GENERATE_A_RANDOM_64_BYTE_HEX_SECRET', ''];
if (UNSAFE_SECRETS.includes(process.env.JWT_SECRET)) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET is not set or uses a placeholder. Generate one with:');
    console.error('  node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
  } else {
    logger.warn('JWT_SECRET is using a placeholder value. Do NOT use this in production.');
  }
}

const app = express();
const httpServer = createServer(app);

// Socket.io setup — reuse same allowed origins
const socketOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: socketOrigins,
    credentials: true,
  },
});

// Make io accessible to controllers
app.set('io', io);

// Socket.io JWT authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error('Invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  logger.debug('Socket connected', { socketId: socket.id, userId: socket.userId });

  // Auto-join the user's own room based on verified JWT
  socket.join(`user:${socket.userId}`);
  logger.debug('User joined room', { userId: socket.userId, socketId: socket.id });

  socket.on('disconnect', () => {
    logger.debug('Socket disconnected', { socketId: socket.id });
  });
});

// HTTPS enforcement in production (behind reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Security headers via Helmet (includes HSTS in production)
app.use(helmet({
  hsts: process.env.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
}));

// CORS — supports comma-separated origins for production (e.g. "https://app.klink.io,https://klink.io")
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// General rate limit on all API routes
app.use('/api', apiLimiter);

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// HTTP request logging
app.use(requestLogger);

// === Health Check ===
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'connected', uptime: process.uptime() });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// === API Routes (v1) ===
app.use('/api/v1/users', userRoute);
app.use('/api/v1/qrcodes', qrRoute);
app.use('/api/v1/analytics', analyticsRoute);
app.use('/api/v1/templates', templateRoute);
app.use('/api/v1/folders', folderRoute);

// Backwards-compatible aliases (redirect /api/* to /api/v1/*)
app.use('/api/users', userRoute);
app.use('/api/qrcodes', qrRoute);
app.use('/api/analytics', analyticsRoute);
app.use('/api/templates', templateRoute);
app.use('/api/folders', folderRoute);

// === Public Scanning Route ===
app.get('/q/:shortId', redirectQR);

// === Centralized Error Handler (must be after routes) ===
app.use(errorHandler);

// === Graceful Shutdown ===
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  httpServer.close(async () => {
    logger.info('HTTP server closed');
    try {
      await sequelize.close();
      logger.info('Database connection closed');
    } catch (err) {
      logger.error('Error closing database', { error: err.message });
    }
    process.exit(0);
  });
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// === Uncaught exception & rejection handlers ===
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { message: reason?.message || reason, stack: reason?.stack });
});

const PORT = process.env.PORT || 5000;

connectDB();

const syncOptions = process.env.NODE_ENV === 'production'
  ? { alter: false }
  : { alter: false };

sequelize.sync(syncOptions).then(() => {
  httpServer.listen(PORT, () => logger.info(`Klink Server running on port ${PORT}`));
}).catch((err) => {
  console.error('=== DATABASE SYNC ERROR ===');
  console.error('Message:', err.message);
  console.error('SQL:', err.sql);
  console.error('Original:', err.original?.message);
  process.exit(1);
});