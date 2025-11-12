// src/app.js - Main Application Entry Point
import "./instrumentation.js";

import { httpServer, httpPort } from "./servers/http.server.js";
import { validateEnv } from "./validations/env.validation.js"; 
import logger from "./libraries/logger.library.js";
// const { logger } = await import("./libraries/logger.library.js");
// const { httpServer, httpPort } = await import("./servers/http.server.js");
// const { validateEnv } = await import("./validations/env.validation.js");

// Validate Environment
try {
  const validEnv = validateEnv();
  logger.info('Environment validation passed');
} catch (error) {
  logger.error('Environment validation failed', { error: error.message });
  process.exit(1);
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
  
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));