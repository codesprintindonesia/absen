import { httpServer, httpPort } from "./servers/http.server.js";
import { validateEnv } from "./validations/env.validation.js"; 
import logger from "./libraries/logger.library.js";


// ================================================================
// STEP 2: Validate Environment
// ================================================================
try {
  const validEnv = validateEnv(); 
} catch (error) { 
  process.exit(1);
} 

// ================================================================
// STEP 3: Start HTTP Server
// ================================================================
httpServer.listen(httpPort, "0.0.0.0", () => { 
  // console.log(`HTTP Server running on port ${httpPort}`);
  logger.info(`HTTP Server running on port ${httpPort}`);
});

const shutdown = async (signal) => { 
  httpServer.close(() => { 
  });
  
  if (tracingSDK) {
    await tracingSDK.shutdown(); 
  }
  
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
