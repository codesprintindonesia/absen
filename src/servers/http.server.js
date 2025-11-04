import express from "express";
import { config as dotenv } from "dotenv";
import Database from "../libraries/databaseConnection.library.js";
import "../models/associations.model.js";
import mainRoutes from "../routes/main.route.js"; 
import { tracingMiddleware } from "../middlewares/tracing.middleware.js";
import swaggerUi from 'swagger-ui-express';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

dotenv();

const httpServer = express();
const httpPort = process.env.PORT || 3000;

/* connect ke database */
(async () => {
  try {
    const db = new Database();
    await db.connect(process.env.DATABASE);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
  }
})();

/* middleware dasar */
httpServer.use(express.json());
httpServer.use(express.urlencoded({ extended: false }));

/* IMPORTANT: Add tracing middleware EARLY in the stack */
if (process.env.SIGNOZ_ENABLED === 'true') {
  httpServer.use(tracingMiddleware);
}


// --- MOUNT SWAGGER (tambah 5 baris ini aja di server yang sama)
const openapiPath = path.resolve('openapi-absensi.yaml'); // letakkan di root project
const swaggerDoc = yaml.parse(fs.readFileSync(openapiPath, 'utf8'));
httpServer.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, { explorer: true }));

/* routes */
httpServer.use("/api", mainRoutes);

/* health check */
httpServer.get("/api/health", (req, res) => { 
  res.json({ 
    ok: true, 
    env: process.env.NODE_ENV, 
    db: process.env.DATABASE,
    tracing: process.env.SIGNOZ_ENABLED === 'true' ? 'enabled' : 'disabled'
  });
});

/* 404 handler */
httpServer.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.jadwalUrl}`);
  res.status(404).json({ code: 404, message: "Service Not Found" });
});

/* error handler */
httpServer.use((err, req, res, next) => {
  console.error(`500 Internal Server Error: ${err.message}`);
  res
    .status(500)
    .json({ code: 500, message: `500 Internal Server Error: ${err.message}` });
});

export { httpServer, httpPort };