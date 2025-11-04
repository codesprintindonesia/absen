import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { databaseFileConfigSchema } from "../validations/databaseConfig.validation.js";
import { encryptString } from "../libraries/encrypt.library.js";
import { sendResponse } from "../helpers/response.helper.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * POST /databases/setup
 * body: { dbName, dbUser, dbPassword, dbHost, dbPort, dbDialect, fileName, timezone?, pool? }
 * hasil: membuat file src/files/databases/{fileName}.json.enc
 */
router.post("/setup",
  validate(databaseFileConfigSchema, "body"),
  async (req, res) => {
    try {
      const payload = req.body;

      // siapkan folder output
      const outDir = path.join(__dirname, "..", "files", "databases");
      await fs.mkdir(outDir, { recursive: true });

      // encrypt
      const plaintext = JSON.stringify(payload);
      const encryptedB64 = encryptString(plaintext);

      // tulis file .enc
      const outFile = path.join(outDir, `${payload.fileName}.json.enc`);
      await fs.writeFile(outFile, encryptedB64, "utf8");

      return sendResponse(res, {
        code: 201,
        message: "Encrypted database config created",
        data: {
          fileName: `${payload.fileName}.json.enc`,
          profile: payload.fileName,
        },
        metadata: {
          outputPath: outFile,
          note: "Set .env -> DATABASE=" + payload.fileName,
        },
      });
    } catch (err) {
      return sendResponse(res, {
        code: 500,
        message: "Failed to create encrypted config",
        data: { error: err.message },
        metadata: null,
      });
    }
  }
);

export default router;
