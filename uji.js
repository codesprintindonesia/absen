// src/app.js
import express from 'express';
import crypto from 'node:crypto';
import baseLogger from './src/libraries/logger.library.js'; // logger yang sudah ada (daily rotate + zip)

const app = express();
app.use(express.json());

/* ===========================================
   Request-ID + child logger per request
   =========================================== */
app.use((req, res, next) => {
  const requestId = (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  res.setHeader('X-Request-ID', requestId);

  // buat child logger berlabel request_id
  req.log = baseLogger.child({ request_id: requestId });

  // simpan start time untuk durasi
  const start = process.hrtime.bigint();

  // Incoming
  req.log.info('Incoming request', {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.socket?.remoteAddress,
    userAgent: req.get?.('user-agent'),
  });

  // Completed
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;
    req.log.info('Request completed', {
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs),
    });
  });

  next();
});

/* ===========================================
   Routes demo
   =========================================== */
app.get('/health', (req, res) => {
  req.log.info('Health check'+ a);
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/simulate/error', (req, res) => {
  // error bisnis yang “tertangani”
  req.log.error('Manual business error', { reason: 'demo' });
  res.status(500).json({ code: 'DEMO_ERROR', message: 'Simulated handled error' });
});

app.get('/simulate/mw-error', (_req, _res, next) => {
  next(new Error('Simulated express middleware error'));
});

app.get('/simulate/exception', (req, res) => {
  setImmediate(() => {
    // uncaughtException (akan ditangkap oleh exceptionHandlers di logger)
    throw new Error('Simulated uncaught exception');
  });
  req.log.warn('Scheduled uncaught exception');
  res.json({ scheduled: true });
});

app.get('/simulate/rejection', (req, res) => {
  setImmediate(() => {
    // unhandledRejection (akan ditangkap oleh rejectionHandlers di logger)
    Promise.reject(new Error('Simulated unhandled rejection'));
  });
  req.log.warn('Scheduled unhandled rejection');
  res.json({ scheduled: true });
});

/* ===========================================
   Error handler (gunakan req.log agar ikut request_id)
   =========================================== */
app.use((err, req, res, _next) => {
  (req.log || baseLogger).error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl || req.url,
  });

  res.status(err.status || 500).json({
    code: 'INTERNAL_ERROR',
    message: err.message || 'Something went wrong',
    request_id: res.getHeader('X-Request-ID'),
  });
});

/* ===========================================
   Global process error handling (fallback)
   =========================================== */
process.on('unhandledRejection', (reason) => {
  baseLogger.error('unhandledRejection', {
    reason: reason instanceof Error ? reason.stack : reason,
  });
});
process.on('uncaughtException', (err) => {
  baseLogger.error('uncaughtException', { message: err.message, stack: err.stack });
  // optionally exit after flush
});

/* ===========================================
   Start server
   =========================================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => baseLogger.info(`🚀 Server running on port ${PORT}`));
