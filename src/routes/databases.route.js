// ================================================================
// src/routes/databases.route.js
// Routes untuk manage encrypted database configuration files
// ================================================================

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { databaseFileConfigSchema } from "../validations/databaseConfig.validation.js";
import { encryptString } from "../libraries/encrypt.library.js";
import { decryptString } from "../libraries/decrypt.library.js";
import { sendResponse } from "../helpers/response.helper.js";
import HTTP_STATUS from "../constants/httpStatus.constant.js";
import logger from "../libraries/logger.library.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database config directory
const DB_CONFIG_DIR = path.join(__dirname, "..", "files", "databases");

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Ensure database config directory exists
 */
const ensureDbConfigDir = async () => {
  try {
    await fs.mkdir(DB_CONFIG_DIR, { recursive: true });
  } catch (error) {
    logger.error("Failed to create database config directory", { error: error.message });
    throw error;
  }
};

/**
 * Check if config file already exists
 */
const configFileExists = async (fileName) => {
  const filePath = path.join(DB_CONFIG_DIR, `${fileName}.json.enc`);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize filename to prevent path traversal
 */
const sanitizeFileName = (fileName) => {
  // Remove any path separators and dangerous characters
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '');
};

/**
 * Get list of all config files
 */
const listConfigFiles = async () => {
  try {
    await ensureDbConfigDir();
    const files = await fs.readdir(DB_CONFIG_DIR);
    return files
      .filter(f => f.endsWith('.json.enc'))
      .map(f => f.replace('.json.enc', ''));
  } catch (error) {
    logger.error("Failed to list config files", { error: error.message });
    return [];
  }
};

// ================================================================
// ROUTE HANDLERS
// ================================================================

/**
 * POST /databases/setup
 * Create new encrypted database configuration file
 *
 * Body: {
 *   dbName: string,
 *   dbUser: string,
 *   dbPassword: string,
 *   dbHost: string,
 *   dbPort: number,
 *   dbDialect: string,
 *   fileName: string,
 *   timezone?: string,
 *   pool?: object
 * }
 *
 * Response: {
 *   code: 201,
 *   message: "Encrypted database config created",
 *   data: { fileName, profile },
 *   metadata: { outputPath, note }
 * }
 */
router.post(
  "/setup",
  validate(databaseFileConfigSchema, "body"),
  async (req, res) => {
    try {
      const payload = req.body;

      // Sanitize filename untuk security
      const sanitizedFileName = sanitizeFileName(payload.fileName);

      if (sanitizedFileName !== payload.fileName) {
        logger.warn("Filename was sanitized", {
          original: payload.fileName,
          sanitized: sanitizedFileName
        });
      }

      // Check if file already exists
      const exists = await configFileExists(sanitizedFileName);
      if (exists) {
        logger.warn("Attempt to overwrite existing config", { fileName: sanitizedFileName });
        return sendResponse(res, {
          httpCode: HTTP_STATUS.CONFLICT,
          code: HTTP_STATUS.CONFLICT,
          message: "Database config file already exists",
          data: {
            fileName: `${sanitizedFileName}.json.enc`,
            note: "Use DELETE endpoint first or choose different fileName",
          },
          metadata: null,
        });
      }

      // Ensure output directory exists
      await ensureDbConfigDir();

      // Prepare payload for encryption (remove fileName from encrypted content)
      const { fileName, ...dbConfig } = payload;
      const configToEncrypt = {
        ...dbConfig,
        createdAt: new Date().toISOString(),
      };

      // Encrypt configuration
      const plaintext = JSON.stringify(configToEncrypt, null, 2);
      const encryptedB64 = encryptString(plaintext);

      // Write encrypted file
      const outFile = path.join(DB_CONFIG_DIR, `${sanitizedFileName}.json.enc`);
      await fs.writeFile(outFile, encryptedB64, "utf8");

      logger.info("Database config created successfully", {
        fileName: sanitizedFileName,
        dbDialect: payload.dbDialect,
        dbHost: payload.dbHost,
      });

      return sendResponse(res, {
        httpCode: HTTP_STATUS.CREATED,
        code: HTTP_STATUS.CREATED,
        message: "Encrypted database config created successfully",
        data: {
          fileName: `${sanitizedFileName}.json.enc`,
          profile: sanitizedFileName,
          dbDialect: payload.dbDialect,
          dbHost: payload.dbHost,
          dbPort: payload.dbPort,
        },
        metadata: {
          outputPath: outFile,
          note: `Set .env -> DATABASE=${sanitizedFileName}`,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      logger.error("Failed to create encrypted config", {
        error: err.message,
        stack: err.stack
      });

      return sendResponse(res, {
        httpCode: HTTP_STATUS.INTERNAL_ERROR,
        code: HTTP_STATUS.INTERNAL_ERROR,
        message: "Failed to create encrypted database config",
        data: {
          error: err.message,
          type: err.name,
        },
        metadata: null,
      });
    }
  }
);

/**
 * GET /databases/configs
 * Get list of all database configuration files
 *
 * Response: {
 *   code: 200,
 *   message: "Database configs retrieved",
 *   data: { configs: [...] },
 *   metadata: { count, directory }
 * }
 */
router.get("/configs", async (req, res) => {
  try {
    const configs = await listConfigFiles();

    logger.info("Database configs listed", { count: configs.length });

    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      code: HTTP_STATUS.OK,
      message: "Database configurations retrieved successfully",
      data: {
        configs: configs.map(name => ({
          profile: name,
          fileName: `${name}.json.enc`,
        })),
      },
      metadata: {
        count: configs.length,
        directory: DB_CONFIG_DIR,
        note: "Use profile name in .env -> DATABASE={profile}",
      },
    });
  } catch (err) {
    logger.error("Failed to list configs", { error: err.message });

    return sendResponse(res, {
      httpCode: HTTP_STATUS.INTERNAL_ERROR,
      code: HTTP_STATUS.INTERNAL_ERROR,
      message: "Failed to retrieve database configurations",
      data: { error: err.message },
      metadata: null,
    });
  }
});

/**
 * GET /databases/configs/:profile
 * Get specific database configuration (decrypted for verification)
 * WARNING: This endpoint exposes sensitive data - should be protected in production
 *
 * Response: {
 *   code: 200,
 *   message: "Database config retrieved",
 *   data: { config (excluding password) },
 *   metadata: { fileName, profile }
 * }
 */
router.get("/configs/:profile", async (req, res) => {
  try {
    const profile = sanitizeFileName(req.params.profile);

    // Check if file exists
    const exists = await configFileExists(profile);
    if (!exists) {
      logger.warn("Config file not found", { profile });
      return sendResponse(res, {
        httpCode: HTTP_STATUS.NOT_FOUND,
        code: HTTP_STATUS.NOT_FOUND,
        message: "Database configuration not found",
        data: { profile },
        metadata: null,
      });
    }

    // Read and decrypt file
    const filePath = path.join(DB_CONFIG_DIR, `${profile}.json.enc`);
    const encryptedContent = await fs.readFile(filePath, "utf8");
    const decryptedContent = decryptString(encryptedContent);
    const config = JSON.parse(decryptedContent);

    // Remove sensitive data before sending (keep dbPassword hidden)
    const safeConfig = {
      ...config,
      dbPassword: "***HIDDEN***",
    };

    logger.info("Database config retrieved", { profile });

    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      code: HTTP_STATUS.OK,
      message: "Database configuration retrieved successfully",
      data: safeConfig,
      metadata: {
        fileName: `${profile}.json.enc`,
        profile,
        warning: "Password is hidden for security. Full config is encrypted on disk.",
      },
    });
  } catch (err) {
    logger.error("Failed to retrieve config", {
      profile: req.params.profile,
      error: err.message
    });

    return sendResponse(res, {
      httpCode: HTTP_STATUS.INTERNAL_ERROR,
      code: HTTP_STATUS.INTERNAL_ERROR,
      message: "Failed to retrieve database configuration",
      data: { error: err.message },
      metadata: null,
    });
  }
});

/**
 * DELETE /databases/configs/:profile
 * Delete database configuration file
 *
 * Response: {
 *   code: 200,
 *   message: "Database config deleted",
 *   data: { profile, fileName },
 *   metadata: { deletedAt }
 * }
 */
router.delete("/configs/:profile", async (req, res) => {
  try {
    const profile = sanitizeFileName(req.params.profile);

    // Check if file exists
    const exists = await configFileExists(profile);
    if (!exists) {
      logger.warn("Attempt to delete non-existent config", { profile });
      return sendResponse(res, {
        httpCode: HTTP_STATUS.NOT_FOUND,
        code: HTTP_STATUS.NOT_FOUND,
        message: "Database configuration not found",
        data: { profile },
        metadata: null,
      });
    }

    // Delete file
    const filePath = path.join(DB_CONFIG_DIR, `${profile}.json.enc`);
    await fs.unlink(filePath);

    logger.info("Database config deleted", { profile, filePath });

    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      code: HTTP_STATUS.OK,
      message: "Database configuration deleted successfully",
      data: {
        profile,
        fileName: `${profile}.json.enc`,
      },
      metadata: {
        deletedAt: new Date().toISOString(),
        warning: "This action cannot be undone. Backup before deletion is recommended.",
      },
    });
  } catch (err) {
    logger.error("Failed to delete config", {
      profile: req.params.profile,
      error: err.message
    });

    return sendResponse(res, {
      httpCode: HTTP_STATUS.INTERNAL_ERROR,
      code: HTTP_STATUS.INTERNAL_ERROR,
      message: "Failed to delete database configuration",
      data: { error: err.message },
      metadata: null,
    });
  }
});

/**
 * PUT /databases/configs/:profile
 * Update existing database configuration
 *
 * Body: Same as POST /databases/setup (except fileName)
 *
 * Response: {
 *   code: 200,
 *   message: "Database config updated",
 *   data: { profile, fileName },
 *   metadata: { updatedAt }
 * }
 */
router.put(
  "/configs/:profile",
  validate(databaseFileConfigSchema, "body"),
  async (req, res) => {
    try {
      const profile = sanitizeFileName(req.params.profile);
      const payload = req.body;

      // Check if file exists
      const exists = await configFileExists(profile);
      if (!exists) {
        logger.warn("Attempt to update non-existent config", { profile });
        return sendResponse(res, {
          httpCode: HTTP_STATUS.NOT_FOUND,
          code: HTTP_STATUS.NOT_FOUND,
          message: "Database configuration not found",
          data: {
            profile,
            note: "Use POST /databases/setup to create new config",
          },
          metadata: null,
        });
      }

      // Prepare payload (remove fileName, add updatedAt)
      const { fileName, ...dbConfig } = payload;
      const configToEncrypt = {
        ...dbConfig,
        updatedAt: new Date().toISOString(),
      };

      // Encrypt configuration
      const plaintext = JSON.stringify(configToEncrypt, null, 2);
      const encryptedB64 = encryptString(plaintext);

      // Write encrypted file (overwrite)
      const outFile = path.join(DB_CONFIG_DIR, `${profile}.json.enc`);
      await fs.writeFile(outFile, encryptedB64, "utf8");

      logger.info("Database config updated", {
        profile,
        dbDialect: payload.dbDialect,
        dbHost: payload.dbHost,
      });

      return sendResponse(res, {
        httpCode: HTTP_STATUS.OK,
        code: HTTP_STATUS.OK,
        message: "Database configuration updated successfully",
        data: {
          profile,
          fileName: `${profile}.json.enc`,
          dbDialect: payload.dbDialect,
          dbHost: payload.dbHost,
          dbPort: payload.dbPort,
        },
        metadata: {
          outputPath: outFile,
          updatedAt: new Date().toISOString(),
          note: "Restart application to apply new database configuration",
        },
      });
    } catch (err) {
      logger.error("Failed to update config", {
        profile: req.params.profile,
        error: err.message
      });

      return sendResponse(res, {
        httpCode: HTTP_STATUS.INTERNAL_ERROR,
        code: HTTP_STATUS.INTERNAL_ERROR,
        message: "Failed to update database configuration",
        data: { error: err.message },
        metadata: null,
      });
    }
  }
);

// ================================================================
// EXPORTS
// ================================================================

export default router;
