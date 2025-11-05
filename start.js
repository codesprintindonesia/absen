// start.js - Entry point application
import { config as dotenv } from "dotenv";

// Load environment variables
dotenv();

// Load application
console.log('[STARTUP] Loading application...');
await import('./src/app.js');
console.log('[STARTUP] Application loaded');