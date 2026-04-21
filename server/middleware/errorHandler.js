import logger from '../utils/logger.js';

export function notFoundHandler(req, res) {
  logger.warn('Route not found', { component: 'error-handler', method: req.method, url: req.originalUrl, ip: req.ip });
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, _next) {
  logger.error('Unhandled error', { component: 'error-handler', error: err.message, stack: err.stack });
  res.status(500).json({ error: err.message || 'Internal server error' });
}
