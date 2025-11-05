// src/servers/http.server.js
import express from "express";
import { config as dotenv } from "dotenv";
import Database from "../libraries/databaseConnection.library.js";
import "../models/associations.model.js";
import mainRoutes from "../routes/main.route.js";
import { requestLoggerMiddleware } from "../middlewares/requestLogger.middleware.js";
import logger from "../libraries/logger.library.js";
import swaggerUi from "swagger-ui-express";
import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import aesMiddleware from "../middlewares/aes.middleware.js";
import asymetricSignatureMiddleware from "../middlewares/asymetricSignature.middleware.js";
import aesRoutes from "../routes/aes.route.js";

dotenv();

const httpServer = express();
const httpPort = process.env.PORT || 3000;

/* Connect to database */
(async () => {
  try {
    const db = new Database();
    await db.connect(process.env.DATABASE);
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection failed", {
      error: error.message,
      stack: error.stack,
    });
  }
})();

/* Middleware dasar */
httpServer.use(express.json());
httpServer.use(express.urlencoded({ extended: false }));

/* Asymetric Signature & AES Encryption */
const asymetricSignature = process.env.ASYMETRIC_SIGNATURE;
const aes = process.env.AES_ENCRYPTION;

if (asymetricSignature === "TRUE") {
  httpServer.use(asymetricSignatureMiddleware());
  logger.info("Asymetric signature middleware mounted");
} else {
  logger.warn("Asymetric signature middleware not mounted");
}

if (aes === "TRUE") {
  httpServer.use(aesMiddleware());
  httpServer.use("/api/aes", aesRoutes);
  logger.info("AES encryption middleware and routes mounted");
} else {
  logger.warn("AES encryption middleware and routes not mounted");
}

/* IMPORTANT: Request Logger Middleware - harus di awal */
httpServer.use(requestLoggerMiddleware);

/* Swagger Documentation */
try {
  const openapiPath = path.resolve("openapi-absensi.yaml");
  const swaggerDoc = yaml.parse(fs.readFileSync(openapiPath, "utf8"));
  httpServer.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, { explorer: true })
  );
  logger.info("Swagger documentation mounted at /docs");
} catch (error) {
  logger.warn("Swagger documentation not available", {
    error: error.message,
  });
}

/* Routes */
httpServer.use("/api", mainRoutes);

/* Health check */
httpServer.get("/api/health", (req, res) => {
  req.log.info("Health check endpoint accessed");

  res.json({
    code: 200,
    message: "OK",
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      db: process.env.DATABASE,
      tracing: process.env.SIGNOZ_ENABLED === "true" ? "enabled" : "disabled",
    },
    metadata: {
      request_id: req.requestId,
    },
  });
});

/* 404 handler */
httpServer.use((req, res) => {
  req.log.warn("Route not found", {
    method: req.method,
    url: req.originalUrl,
  });

  res.status(404).json({
    code: 404,
    message: "Service Not Found",
    data: null,
    metadata: {
      request_id: req.requestId,
      path: req.originalUrl,
    },
  });
});

/* Error handler */
httpServer.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  // Use req.log if available, otherwise use base logger
  const logInstance = req.log || logger;

  logInstance.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    statusCode,
    method: req.method,
    url: req.originalUrl,
  });

  res.status(statusCode).json({
    code: statusCode,
    message: err.message || "500 Internal Server Error",
    data: null,
    metadata: {
      request_id: req.requestId,
      error_id: `ERR_${Date.now()}`,
    },
  });
});

export { httpServer, httpPort };
