// src/app.js - Main Application Entry Point
import { httpServer, httpPort } from "./servers/http.server.js";
import { validateEnv } from "./validations/env.validation.js"; 
import logger from "./libraries/logger.library.js";

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
    env: process.env.NODE_ENV,
    tracing: process.env.SIGNOZ_ENABLED === 'true' ? 'enabled' : 'disabled',
  });
});

// Graceful Shutdown Handler
const shutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully...`);
  
  // Close HTTP server
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
  
  // Shutdown tracing SDK if available
  if (global.tracingSDK) {
    try {
      await global.tracingSDK.shutdown();
      logger.info('Tracing SDK shutdown complete');
    } catch (error) {
      logger.error('Error shutting down tracing SDK', { error: error.message });
    }
  }
  
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));