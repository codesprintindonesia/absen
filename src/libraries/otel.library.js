/*
 * Filename: e:\NODE\eXStarter5\src\configs\opentelemetry.config copy 2.ts
 * Path: e:\NODE\eXStarter5
 * Created Date: Saturday, October 11th 2025, 6:46:24 pm
 * Author: Rede
 *
 * Copyright (c) 2022 10RI Dev
 */
// src/configs/opentelemetry.config.ts
import * as logsAPI from "@opentelemetry/api-logs";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { WinstonInstrumentation } from "@opentelemetry/instrumentation-winston";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  LoggerProvider,
  BatchLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { NodeSDK as NodeSDKClass } from "@opentelemetry/sdk-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
// import { config } from "./index.config.js";

import { config as dotenvConfig } from "dotenv";
dotenvConfig();
// ============================================
// import { Resource } from '@opentelemetry/resources';
// ============================================
// Constants
// ============================================
const OTEL_CONSTANTS = {
  MAX_QUEUE_SIZE: 2048,
  MAX_EXPORT_BATCH_SIZE: 512,
  SCHEDULED_DELAY_MS: 5000,
  EXPORT_TIMEOUT_MS: 30000,
};
const DEFAULT_SERVICE_NAME = "express-api";
const DEFAULT_SERVICE_VERSION = "1.0.0";
// ============================================
// Singleton State
// ============================================
class OpenTelemetryService {
  static instance = null;
  sdk = null;
  loggerProvider = null;
  initialized = false;
  isShuttingDown = false;
  constructor() {}
  static getInstance() {
    OpenTelemetryService.instance ??= new OpenTelemetryService();
    return OpenTelemetryService.instance;
  }
  getConfig() {
    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    const enableOtel = !!endpoint; // Enable jika ada endpoint

    // DEBUG: Log raw endpoint
    console.log(
      "[OpenTelemetry] Raw endpoint from env:",
      JSON.stringify(endpoint)
    );

    return {
      serviceName: process.env.OTEL_SERVICE_NAME || DEFAULT_SERVICE_NAME,
      serviceVersion:
        process.env.OTEL_SERVICE_VERSION || DEFAULT_SERVICE_VERSION,
      environment:
        process.env.OTEL_ENVIRONMENT || process.env.NODE_ENV || "development",
      exporterEndpoint: endpoint || "http://localhost:4318",
      enableLogs: enableOtel, // Enable logs jika endpoint ada
      enableTraces: enableOtel, // Enable traces jika endpoint ada
    };
  }
  createResource(otelConfig) {
    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: otelConfig.serviceName,
      [ATTR_SERVICE_VERSION]: otelConfig.serviceVersion,
    });
    return resource;
  }
  setupLogProvider(resource, endpoint) {
    console.log("[OpenTelemetry] Setting up log provider...");

    const logExporter = new OTLPLogExporter({
      url: `${endpoint}/v1/logs`,
      headers: {},
      timeoutMillis: OTEL_CONSTANTS.EXPORT_TIMEOUT_MS,
    });

    console.log("[OpenTelemetry] Log exporter URL:", `${endpoint}/v1/logs`);

    // Create batch processor
    const logRecordProcessor = new BatchLogRecordProcessor(logExporter, {
      maxQueueSize: OTEL_CONSTANTS.MAX_QUEUE_SIZE,
      maxExportBatchSize: OTEL_CONSTANTS.MAX_EXPORT_BATCH_SIZE,
      scheduledDelayMillis: OTEL_CONSTANTS.SCHEDULED_DELAY_MS,
      exportTimeoutMillis: OTEL_CONSTANTS.EXPORT_TIMEOUT_MS,
    });

    // Create logger provider with processor in constructor
    const loggerProvider = new LoggerProvider({
      resource,
      logRecordProcessors: [logRecordProcessor], // Pass as array in constructor
    });

    // Set as GLOBAL logger provider
    logsAPI.logs.setGlobalLoggerProvider(loggerProvider);
    console.log("[OpenTelemetry] Global LoggerProvider set successfully");

    return loggerProvider;
  }
  createTraceExporter(endpoint) {
    return new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
      headers: {},
      timeoutMillis: OTEL_CONSTANTS.EXPORT_TIMEOUT_MS,
    });
  }
  initialize() {
    if (this.initialized) {
      console.log("[OpenTelemetry] Already initialized, skipping");
      return this.sdk;
    }
    try {
      console.log("[OpenTelemetry] Initializing...");
      const otelConfig = this.getConfig();
      // Check if OpenTelemetry is disabled
      if (!otelConfig.enableLogs && !otelConfig.enableTraces) {
        console.log("[OpenTelemetry] Disabled via configuration");
        this.initialized = true;
        this.sdk = this.createMockSDK();
        return this.sdk;
      }
      console.log(`[OpenTelemetry] Endpoint: ${otelConfig.exporterEndpoint}`);
      console.log(
        `[OpenTelemetry] Service: ${otelConfig.serviceName}@${otelConfig.serviceVersion}`
      );
      console.log(`[OpenTelemetry] Environment: ${otelConfig.environment}`);
      const resource = this.createResource(otelConfig);

      // Setup trace exporter dan SDK FIRST (termasuk WinstonInstrumentation)
      if (otelConfig.enableTraces) {
        const traceExporter = this.createTraceExporter(
          otelConfig.exporterEndpoint
        );

        console.log(
          "[OpenTelemetry] Configuring SDK and WinstonInstrumentation..."
        );

        this.sdk = new NodeSDKClass({
          resource,
          spanProcessors: [
            new BatchSpanProcessor(traceExporter, {
              maxQueueSize: OTEL_CONSTANTS.MAX_QUEUE_SIZE,
              maxExportBatchSize: OTEL_CONSTANTS.MAX_EXPORT_BATCH_SIZE,
              scheduledDelayMillis: OTEL_CONSTANTS.SCHEDULED_DELAY_MS,
              exportTimeoutMillis: OTEL_CONSTANTS.EXPORT_TIMEOUT_MS,
            }),
          ],
          instrumentations: [
            getNodeAutoInstrumentations({
              // eslint-disable-next-line @typescript-eslint/naming-convention
              "@opentelemetry/instrumentation-fs": { enabled: false },
              // eslint-disable-next-line @typescript-eslint/naming-convention
              "@opentelemetry/instrumentation-net": { enabled: false },
              // eslint-disable-next-line @typescript-eslint/naming-convention
              "@opentelemetry/instrumentation-dns": { enabled: false },
            }),
            new WinstonInstrumentation({
              enabled: true,
              disableLogCorrelation: false, // Inject trace_id, span_id
              disableLogSending: true, // CRITICAL: Forward logs ke OTLP
            }),
          ],
        });

        this.sdk.start();
        console.log("[OpenTelemetry] SDK started successfully");
        console.log("[OpenTelemetry] WinstonInstrumentation is active");
      }

      // Setup log provider AFTER SDK started
      if (otelConfig.enableLogs) {
        this.loggerProvider = this.setupLogProvider(
          resource,
          otelConfig.exporterEndpoint
        );
      }

      this.initialized = true;
      this.setupShutdownHandlers();
      return this.sdk;
    } catch (error) {
      console.error("[OpenTelemetry] Failed to initialize:", error);
      this.initialized = true;
      this.sdk = this.createMockSDK();
      return this.sdk;
    }
  }
  createMockSDK() {
    return {
      shutdown: async () => {
        return await Promise.resolve();
      },
      start: () => {
        console.log("[OpenTelemetry] Mock SDK started");
        return;
      },
    };
  }
  setupShutdownHandlers() {
    const shutdownHandler = () => {
      if (!this.isShuttingDown) {
        void this.shutdown();
      }
    };
    process.on("SIGTERM", shutdownHandler);
    process.on("SIGINT", shutdownHandler);
  }
  async shutdown() {
    if (this.isShuttingDown) {
      return;
    }
    this.isShuttingDown = true;
    console.log("[OpenTelemetry] Shutting down...");

    try {
      // Shutdown logger provider first
      if (this.loggerProvider) {
        await this.loggerProvider.shutdown();
        console.log("[OpenTelemetry] Logger provider shut down");
      }

      // Then shutdown SDK
      if (this.sdk) {
        await this.sdk.shutdown();
        console.log("[OpenTelemetry] SDK shut down");
      }

      console.log("[OpenTelemetry] Shutdown complete");
    } catch (error) {
      console.error("[OpenTelemetry] Shutdown error:", error);
    } finally {
      this.isShuttingDown = false;
    }
  }
  isInitialized() {
    return this.initialized;
  }
}
// ============================================
// Export Singleton Instance
// ============================================
export const openTelemetry = OpenTelemetryService.getInstance();
// Convenience function for backward compatibility
export const setupOpenTelemetry = () => {
  return openTelemetry.initialize();
};
