import morgan from 'morgan';
import logger from '../config/logger.js';

// Stream morgan output into winston
const stream = {
  write: (message) => {
    logger.info(message.trim(), { type: 'http' });
  },
};

// Custom token for response time coloring in logs
morgan.token('status-color', (req, res) => res.statusCode);

// Format: method url status responseTime ms - contentLength
const format = ':method :url :status :response-time ms - :res[content-length]';

const requestLogger = morgan(format, {
  stream,
  // Skip logging for health-check or static asset requests
  skip: (req) => req.url === '/health' || req.url === '/favicon.ico',
});

export default requestLogger;
