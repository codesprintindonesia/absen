// src/otel.js - OpenTelemetry Configuration
// This file should be loaded BEFORE app.js

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';

console.log('[OTEL] Initializing OpenTelemetry SDK...');

// Optional: Load api-logs if available
let logsAPI = null;
try {
  logsAPI = await import('@opentelemetry/api-logs');
  console.log('[OTEL] api-logs loaded');
} catch (error) {
  console.warn('[OTEL] api-logs not found, continuing without global logger');
}

// Logs pipeline
try {
  const loggerProvider = new LoggerProvider({
    processors: [new BatchLogRecordProcessor(new OTLPLogExporter())],
  });
  
  if (logsAPI) {
    logsAPI.logs.setGlobalLoggerProvider(loggerProvider);
  }
  
  console.log('[OTEL] Logs pipeline configured');
} catch (error) {
  console.error('[OTEL] Failed to configure logs pipeline:', error.message);
}

// Traces pipeline
const spanProcessors = [new BatchSpanProcessor(new OTLPTraceExporter())];

const sdk = new NodeSDK({
  spanProcessors,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Disable FS instrumentation to reduce noise
      },
    }),
    new WinstonInstrumentation({
      disableLogCorrelation: false,
      disableLogSending: false,
    }),
  ],
});

// Start SDK
try {
  await sdk.start();
  console.log('[OTEL] SDK started successfully');
  
  // Export SDK for shutdown handling
  global.tracingSDK = sdk;
} catch (error) {
  console.error('[OTEL] Failed to start SDK:', error.message);
  throw error;
}

// Shutdown handler
process.on('SIGTERM', async () => {
  console.log('[OTEL] Shutting down SDK...');
  try {
    await sdk.shutdown();
    console.log('[OTEL] SDK shutdown complete');
  } catch (error) {
    console.error('[OTEL] Error during shutdown:', error.message);
  } finally {
    process.exit(0);
  }
});