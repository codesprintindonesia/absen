// otel.mjs
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';

import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';

// (opsional) pakai api-logs jika tersedia
let logsAPI = null;
try {
  logsAPI = await import('@opentelemetry/api-logs');
} catch {
  console.warn('[OTEL] api-logs not found, continuing without global logger');
}

// ==== Logs pipeline (tanpa Resource manual) ====
const loggerProvider = new LoggerProvider({
  processors: [new BatchLogRecordProcessor(new OTLPLogExporter())],
});
if (logsAPI) {
  logsAPI.logs.setGlobalLoggerProvider(loggerProvider);
}

// ==== Traces pipeline ====
const spanProcessors = [new BatchSpanProcessor(new OTLPTraceExporter())];

const sdk = new NodeSDK({
  spanProcessors,
  instrumentations: [
    getNodeAutoInstrumentations(),
    new WinstonInstrumentation({
      disableLogCorrelation: false,
      disableLogSending: false,
    }),
  ],
});

await sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});
