// src/app.js - Main Application Entry Point
import "./instrumentation.js";

import { httpServer, httpPort } from "./servers/http.server.js";
import { validateEnv } from "./validations/env.validation.js";
import logger from "./libraries/logger.library.js";
import { initializeCronScheduler, shutdownCronScheduler } from "./schedulers/centralizedCron.scheduler.js";
 
// Validate Environment
try {
  const validEnv = validateEnv();
  logger.info('Environment validation passed');
} catch (error) {
  logger.error('Environment validation failed', { error: error.message });
  process.exit(1);
} 

// Initialize Cron Scheduler
try {
  await initializeCronScheduler();
  logger.info('Cron scheduler initialized successfully');
} catch (error) {
  logger.error('Failed to initialize cron scheduler', { error: error.message });
  // Continue without cron scheduler - non-critical
}

// Start HTTP Server
httpServer.listen(httpPort, "0.0.0.0", () => {
  logger.info(`HTTP Server running on port ${httpPort}`, {
    env: process.env.NODE_ENV
  });
});

// Graceful Shutdown Handler
const shutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully...`);

  // Shutdown cron scheduler first
  try {
    shutdownCronScheduler();
    logger.info('Cron scheduler shutdown complete');
  } catch (error) {
    logger.error('Error shutting down cron scheduler', { error: error.message });
  }

  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));