// src/servers/http.server.js
import express from "express";
import { config as dotenv } from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import Database from "../libraries/databaseConnection.library.js";
import "../models/associations.model.js";
import mainRoutes from "../routes/main.route.js";
import { requestLoggerMiddleware } from "../middlewares/requestLogger.middleware.js";
import logger from "../libraries/logger.library.js";
import { specs, swaggerUi } from "../configs/swagger.config.js";
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

// ================================================================
// SECURITY MIDDLEWARES (Applied First)
// ================================================================

/* Helmet - Security Headers */
httpServer.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // For Swagger UI
      scriptSrc: ["'self'", "'unsafe-inline'"], // For Swagger UI
      imgSrc: ["'self'", "data:", "validator.swagger.io"], // For Swagger UI
    },
  },
  crossOriginEmbedderPolicy: false, // For Swagger UI compatibility
}));
logger.info("Helmet security headers enabled");

/* CORS Configuration */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5000'];

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      logger.warn('CORS request blocked', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400, // 24 hours
};

httpServer.use(cors(corsOptions));
logger.info("CORS enabled with origin validation");

/* Rate Limiting */
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per windowMs
  message: {
    code: 429,
    message: "Too many requests from this IP, please try again later.",
    data: null,
    metadata: {
      retryAfter: "15 minutes",
    },
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/api/health';
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(options.statusCode).json(options.message);
  },
});

// Apply rate limiting to all API routes
httpServer.use('/api', limiter);
logger.info("Rate limiting enabled (100 req/15min default)");

// ================================================================
// BASIC MIDDLEWARES
// ================================================================

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

/* Swagger Documentation - Auto-generated from JSDoc */
httpServer.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  })
);
logger.info("Swagger documentation mounted at /docs (auto-generated)");

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
