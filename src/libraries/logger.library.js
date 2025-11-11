// src/logger.mjs
import fs from "node:fs";
import path from "node:path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';

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

// const logger = winston.createLogger({
//   level: LOG_LEVEL,
//   format,
//   transports: [
//     new winston.transports.Console({
//       level: LOG_LEVEL,
//       format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.simple()
//       ),
//     }),
//     allRotate,
//     errRotate,
//   ],
//   exceptionHandlers: [excRotate],
//   rejectionHandlers: [rejRotate],
//   exitOnError: false,
// });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  // simple format to keep output readable in terminal
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      const { timestamp, level, message, ...meta } = info;
      const metaStr = Object.keys(meta).length
        ? ` ${JSON.stringify(meta)}`
        : "";
      return `${timestamp} ${level}: ${message}${metaStr}`;
    })
  ),
  transports: [new winston.transports.Console(), new OpenTelemetryTransportV3()],
  // defaultMeta: { service: "winston-express-demo" }, // adds to every line
});

export default logger;
