// src/libraries/winston.lib.ts
import { hostname } from "node:os";
import { OpenTelemetryTransportV3 } from "@opentelemetry/winston-transport";
import axios from "axios";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import Transport from "winston-transport";
// import { config } from '../configs/index.config.js';
import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import { getRequestId } from "../helpers/requestContext.helper.js";
// ============================================
// Constants
// ============================================
const DEFAULT_RETRY_COUNT = 5;
const DEFAULT_RETRY_DELAY = 2000;
const DEFAULT_TIMEOUT = 10000;
// ============================================
// Logstash Transport
// ============================================
class LogstashTransport extends Transport {
  logstashUrl;
  prodId;
  retryCount;
  retryDelay;
  timeout;
  constructor(opts) {
    super(opts);
    this.logstashUrl = process.env.LOGSTASH_URL ?? "";
    this.prodId = process.env.LOGSTASH_PROD_ID ?? "unknown";
    this.retryCount = parseInt(
      process.env.LOGSTASH_RETRY_COUNT?.toString() ??
        String(DEFAULT_RETRY_COUNT),
      10
    );
    this.retryDelay = parseInt(
      process.env.LOGSTASH_RETRY_DELAY?.toString() ??
        String(DEFAULT_RETRY_DELAY),
      10
    );
    this.timeout = parseInt(
      process.env.LOGSTASH_TIMEOUT?.toString() ?? String(DEFAULT_TIMEOUT),
      10
    );
    if (!this.logstashUrl) {
      console.warn("[Logstash] URL not configured, transport disabled");
    }
  }
  async sendToLogstash(info, attempt = 1) {
    if (!this.logstashUrl) {
      return;
    }
    const {
      level,
      message,
      requestId,
      request,
      response,
      timestamp: _timestamp,
      ...otherMeta
    } = info;
    // Gunakan requestId yang sudah ada, jangan panggil getRequestId() lagi
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      message,
      requestId: requestId || "unknown",
      prod_id: this.prodId,
      environment: process.env.NODE_ENV ?? "development",
      service: process.env.SERVICE_NAME ?? "unknown-service",
      hostname: hostname(),
      ...otherMeta,
      request: request ? this.sanitizeObject(request) : undefined,
      response: response ? this.sanitizeObject(response) : undefined,
    };
    try {
      const axiosResponse = await axios.post(this.logstashUrl, logData, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "Content-Type": "application/json",
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "User-Agent": `app-api/${this.prodId}`,
        },
        timeout: this.timeout,
      });
      if (axiosResponse.status !== 200) {
        throw new Error(
          `Logstash responded with status: ${axiosResponse.status}`
        );
      }
    } catch (error) {
      if (attempt < this.retryCount) {
        console.warn(
          `[Logstash] Failed to send (attempt ${attempt}/${this.retryCount}), retrying...`
        );
        setTimeout(() => {
          void this.sendToLogstash(info, attempt + 1);
        }, this.retryDelay * attempt);
      } else {
        console.error(
          "[Logstash] Failed after all retries:",
          error instanceof Error ? error.message : error
        );
      }
    }
  }
  sanitizeObject(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }
    if (typeof obj !== "object") {
      return obj;
    }
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    const seen = new WeakSet();
    return JSON.parse(
      JSON.stringify(obj, (_key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular]";
          }
          seen.add(value);
        }
        return value;
      })
    );
  }
  log(info, callback) {
    setImmediate(() => {
      void this.sendToLogstash(info);
    });
    callback();
  }
}
// ============================================
// Winston Formats
// ============================================
const timestampFormat = winston.format((info) => {
  info.timestamp = new Date().toISOString();
  return info;
});
const reorderFormat = winston.format((info) => {
  const {
    timestamp,
    level,
    message,
    requestId,
    response,
    request,
    ...otherRest
  } = info;
  // Jangan panggil getRequestId() lagi, gunakan requestId yang sudah ada
  const cleanResponse = response
    ? {
        statusCode: response.statusCode,
        body: response.body,
        message: response.message,
      }
    : undefined;
  const cleanRequest = request
    ? {
        method: request.method,
        path: request.url?.path,
        body: request.body,
        client: request.client,
      }
    : undefined;
  return {
    requestId: requestId || "unknown",
    timestamp,
    level,
    message,
    ...otherRest,
    request: cleanRequest,
    response: cleanResponse,
  };
});
// ============================================
// Transport Configuration
// ============================================
const getFileTransport = (isError = false) => {
  return new DailyRotateFile({
    datePattern: "YYYY-MM-DD",
    dirname: process.env.LOG_DIR ?? "logs",
    zippedArchive: true,
    maxFiles: process.env.LOG_MAX_FILES ?? "5",
    maxSize: process.env.LOG_MAX_SIZE ?? "5m",
    level: isError ? "error" : "silly",
    filename: isError ? "error-%DATE%.log" : "%DATE%.log",
    handleExceptions: isError && process.env.NODE_ENV === "production",
    handleRejections: isError && (process.env.LOG_REJECTIONS ?? false),
    format: winston.format.combine(
      timestampFormat(),
      reorderFormat(),
      winston.format.json()
    ),
  });
};
let logstashMessageLogged = false;
let otelMessageLogged = false;
const getTransports = (isError = false) => {
  const transports = [getFileTransport(isError)];
  // Console transport for development
  if (process.env.NODE_ENV !== "production") {
    transports.push(
      new winston.transports.Console({
        level: isError ? "error" : "debug",
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          winston.format.printf(
            ({ timestamp, level, message, requestId, ...meta }) => {
              const metaStr =
                Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
              return `${timestamp} [${level}] ${
                requestId ? `[${requestId}] ` : ""
              }${message}${metaStr}`;
            }
          )
        ),
      })
    );
  }
  // OpenTelemetry transport
  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    transports.push(
      new OpenTelemetryTransportV3({
        level: isError ? "error" : "info",
      })
    );

    if (!otelMessageLogged) {
      console.log("[OpenTelemetry] Winston transport enabled");
      otelMessageLogged = true;
    }
  }
  // Logstash transport
  if (process.env.LOGSTASH_ENABLED) {
    if (!process.env.LOGSTASH_URL) {
      console.warn("[Logstash] Enabled but URL not configured");
    } else {
      transports.push(
        new LogstashTransport({
          level: isError ? "error" : "info",
        })
      );
      if (!logstashMessageLogged) {
        console.log("[Logstash] Transport enabled:", process.env.LOGSTASH_URL);
        logstashMessageLogged = true;
      }
    }
  }
  return transports;
};
// ============================================
// Logger Instances
// ============================================
const errorLogger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    timestampFormat(),
    reorderFormat(),
    winston.format.json()
  ),
  defaultMeta: { service: process.env.OTEL_SERVICE_NAME ?? "unknown-service" },
  transports: getTransports(true),
});

// DEBUG: Hook untuk monitor log event
const infoLogger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: winston.format.combine(
    timestampFormat(),
    reorderFormat(),
    winston.format.json()
  ),
  defaultMeta: { service: process.env.OTEL_SERVICE_NAME ?? "unknown-service" },
  transports: getTransports(false),
});
// ============================================
// Format Helpers
// ============================================
export const logFormat = (clientRequest, clientResponse) => {
  return {
    request: {
      method: clientRequest.method,
      body: clientRequest.body,
      url: {
        path: clientRequest.originalUrl,
      },
      client: {
        ip:
          clientRequest.header?.("x-forwarded-for") ??
          clientRequest.socket?.remoteAddress,
        port: clientRequest.socket?.remotePort,
      },
    },
    response: clientResponse,
    statusCode: clientResponse.statusCode,
  };
};
export const logFormatValidation = logFormat;
export const logFormatAxios = (axiosConfig, response) => {
  const axiosResponse = response;
  return {
    request: {
      method: axiosConfig.method,
      body: axiosConfig.data,
      url: {
        path: axiosConfig.url,
      },
    },
    response: {
      statusCode: axiosResponse.status,
      message: axiosResponse.statusText,
      body: axiosResponse.data,
    },
    error: axiosResponse.isAxiosError
      ? {
          message: axiosResponse.message,
          stack: axiosResponse.stack,
        }
      : undefined,
  };
};
// ============================================
// Logger API
// ============================================
export const logger = {
  error: (message, meta) => {
    // Prioritaskan request_id dari meta, baru fallback ke getRequestId()
    const requestId = meta?.request_id || getRequestId();
    errorLogger.error({
      message,
      requestId,
      ...(typeof meta === "object" && meta !== null ? meta : {}),
    });
  },
  warn: (message, meta) => {
    // Prioritaskan request_id dari meta, baru fallback ke getRequestId()
    const requestId = meta?.request_id || getRequestId();
    infoLogger.warn({
      message,
      requestId,
      ...(typeof meta === "object" && meta !== null ? meta : {}),
    });
  },
  info: (message, meta) => {
    // Prioritaskan request_id dari meta, baru fallback ke getRequestId()
    const requestId = meta?.request_id || getRequestId();

    infoLogger.info({
      message,
      requestId,
      ...(typeof meta === "object" && meta !== null ? meta : {}),
    });
  },
  verbose: (message, meta) => {
    // Prioritaskan request_id dari meta, baru fallback ke getRequestId()
    const requestId = meta?.request_id || getRequestId();
    infoLogger.verbose({
      message,
      requestId,
      ...(typeof meta === "object" && meta !== null ? meta : {}),
    });
  },
  debug: (message, meta) => {
    // Prioritaskan request_id dari meta, baru fallback ke getRequestId()
    const requestId = meta?.request_id || getRequestId();
    infoLogger.debug({
      message,
      requestId,
      ...(typeof meta === "object" && meta !== null ? meta : {}),
    });
  },
  silly: (message, meta) => {
    // Prioritaskan request_id dari meta, baru fallback ke getRequestId()
    const requestId = meta?.request_id || getRequestId();
    infoLogger.silly({
      message,
      requestId,
      ...(typeof meta === "object" && meta !== null ? meta : {}),
    });
  },
  logRequest: (req, additionalMeta) => {
    const requestId = getRequestId();
    const requestData = {
      method: req.method,
      originalUrl: req.originalUrl,
      ip: req.header?.("x-forwarded-for") ?? req.socket?.remoteAddress,
      userAgent: req.header?.("user-agent"),
      ...(typeof additionalMeta === "object" && additionalMeta !== null
        ? additionalMeta
        : {}),
    };
    infoLogger.info({
      message: `${req.method} ${req.originalUrl}`,
      requestId,
      request: requestData,
    });
  },
  logResponse: (req, res, additionalMeta) => {
    const requestId = getRequestId();
    const responseData = logFormat(req, res);
    infoLogger.info({
      message: `${req.method} ${req.originalUrl} - ${res.statusCode}`,
      requestId,
      ...responseData,
      ...(typeof additionalMeta === "object" && additionalMeta !== null
        ? additionalMeta
        : {}),
    });
  },
  logError: (error, req, additionalMeta) => {
    const requestId = getRequestId();
    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      request: req
        ? {
            method: req.method,
            originalUrl: req.originalUrl,
            ip: req.header?.("x-forwarded-for") ?? req.socket?.remoteAddress,
          }
        : undefined,
      ...(typeof additionalMeta === "object" && additionalMeta !== null
        ? additionalMeta
        : {}),
    };
    errorLogger.error({
      message: `Error: ${error.message}`,
      requestId,
      error: errorData,
    });
  },
};
