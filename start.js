// start.js - Entry point application
// Load OpenTelemetry FIRST (if enabled) before anything else

import { config as dotenv } from "dotenv";

// Load environment variables first
dotenv();

// Conditional import OpenTelemetry
if (process.env.SIGNOZ_ENABLED === 'true') {
  console.log('[STARTUP] Loading OpenTelemetry...');
  try {
    // Dynamic import untuk handle async
    await import('./src/otel.js');
    console.log('[STARTUP] OpenTelemetry loaded successfully');
  } catch (error) {
    console.error('[STARTUP] Failed to load OpenTelemetry:', error.message);
    console.error('[STARTUP] Continuing without tracing...');
    // Set to false to prevent further tracing attempts
    process.env.SIGNOZ_ENABLED = 'false';
  }
} else {
  console.log('[STARTUP] OpenTelemetry disabled');
}

// Load application AFTER OpenTelemetry is ready
console.log('[STARTUP] Loading application...');
await import('./src/app.js');
console.log('[STARTUP] Application loaded');