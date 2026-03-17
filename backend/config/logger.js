import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logsDir = join(__dirname, '..', 'logs');

const isProd = process.env.NODE_ENV === 'production';

// Custom format: timestamp [level] message + metadata
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level.toUpperCase()}] ${stack || message}${metaStr}`;
  })
);

// Console format with colors for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${stack || message}${metaStr}`;
  })
);

// Daily rotating file for combined logs (all levels)
const combinedTransport = new DailyRotateFile({
  dirname: logsDir,
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
  maxFiles: '14d',
  level: 'info',
  format: logFormat,
});

// Daily rotating file for errors only
const errorTransport = new DailyRotateFile({
  dirname: logsDir,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '10m',
  maxFiles: '30d',
  level: 'error',
  format: logFormat,
});

const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  transports: [
    combinedTransport,
    errorTransport,
    // Console output — always on in dev, silent in prod
    new winston.transports.Console({
      silent: isProd,
      format: consoleFormat,
    }),
  ],
  // Don't exit on uncaught exceptions — log them instead
  exitOnError: false,
});

export default logger;
