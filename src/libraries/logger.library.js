// src/logger.mjs
import fs from "node:fs";
import { hostname } from "node:os";
import path from "node:path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import Transport from "winston-transport"; 
import { config as dotenv} from "dotenv"; 

dotenv();

const LOG_ROOT = process.env.LOG_ROOT || "logs";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const MAX_SIZE = process.env.LOG_FILE_MAX_SIZE || "10m";

// pastikan folder logs ada
fs.mkdirSync(LOG_ROOT, { recursive: true });

const format = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json()
);

// === transport harian (semua level)
const allRotate = new DailyRotateFile({
  dirname: path.join(LOG_ROOT, "%DATE%"),
  filename: "app.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: MAX_SIZE,
  level: LOG_LEVEL,
});

// === transport error
const errRotate = new DailyRotateFile({
  dirname: path.join(LOG_ROOT, "%DATE%"),
  filename: "error.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: MAX_SIZE,
  level: "error",
});

// === transport exceptions & rejections
const excRotate = new DailyRotateFile({
  dirname: path.join(LOG_ROOT, "%DATE%"),
  filename: "exceptions.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: MAX_SIZE,
  handleExceptions: true,
  level: "error",
});

const rejRotate = new DailyRotateFile({
  dirname: path.join(LOG_ROOT, "%DATE%"),
  filename: "rejections.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: MAX_SIZE,
  handleRejections: true,
  level: "error",
});

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format,
  transports: [
    new winston.transports.Console({
      level: LOG_LEVEL,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // OpenTelemetry transport - mengirim logs ke OTel Collector/SigNoz
    new OpenTelemetryTransportV3({
      level: LOG_LEVEL,
    }),
    allRotate,
    errRotate,
  ],
  exceptionHandlers: [excRotate],
  rejectionHandlers: [rejRotate],
  exitOnError: false,
}); 

export default logger;
