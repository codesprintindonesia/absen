// src/middlewares/requestLogger.middleware.js
import crypto from "node:crypto";
import logger from "../libraries/logger.library.js";

/**
 * Request Logger Middleware
 * Logs:
 * 1. Incoming request (start)
 * 2. All processes (via req.log)
 * 3. Request completion (finish)
 *
 * All logs share the same request_id for correlation
 */
export const requestLoggerMiddleware = (req, res, next) => {
  // Generate unique request ID
  const requestId = crypto.randomUUID();

  // Set request ID in response header
  res.setHeader("X-Request-ID", requestId);

  // Store request ID in request object
  req.requestId = requestId;

  // Create child logger with request_id for correlation
  req.log = logger.child({
    request_id: requestId,
  });

  // Capture start time untuk duration calculation
  const startTime = process.hrtime.bigint();

  // Log incoming request
  req.log.info("Incoming request", {
    method: req.method,
    url: req.originalUrl || req.url,
    path: req.path,
    query: req.query,
    ip: req.ip || req.socket?.remoteAddress,
    userAgent: req.get("user-agent"),
  });

  // Capture original res.json untuk log response body
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    res.locals.responseBody = body;
    return originalJson(body);
  };

  // Log when response is finished
  res.on("finish", () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6; // Convert to milliseconds

    req.log.info("Request completed", {
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100, // Round to 2 decimal
      responseBody: res.locals.responseBody,
    });
  });

  // Log if connection closes unexpectedly
  res.on("close", () => {
    if (!res.writableEnded) {
      req.log.warn("Connection closed before response completed", {
        statusCode: res.statusCode,
      });
    }
  });

  next();
};

/**
 * Helper function untuk log di dalam service/repository
 * Usage: logProcess(req, 'Fetching data from database', { userId: 123 })
 */
export const logProcess = (req, message, metadata = {}) => {
  if (req && req.log) {
    req.log.info(message, metadata);
  } else {
    logger.info(message, metadata);
  }
};

/**
 * Helper function untuk log error di dalam service/repository
 * Usage: logError(req, 'Database query failed', error, { query: 'SELECT...' })
 */
export const logError = (req, message, error, metadata = {}) => {
  const errorData = {
    ...metadata,
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
  };

  if (req && req.log) {
    req.log.error(message, errorData);
  } else {
    logger.error(message, errorData);
  }
};

/**
 * Helper function untuk log warning
 * Usage: logWarning(req, 'Slow query detected', { duration: 5000 })
 */
export const logWarning = (req, message, metadata = {}) => {
  if (req && req.log) {
    req.log.warn(message, metadata);
  } else {
    logger.warn(message, metadata);
  }
};
