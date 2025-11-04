// src/helpers/crypto.helper.js
import crypto from "crypto";
import { config } from "dotenv";
config();

/**
 * Ambil key enkripsi dari ENV
 */
const getEncryptionKey = () => { 
  const key = process.env.CONFIG_ENC_KEY || "";
  if (key.length < 32) {
    throw new Error("CONFIG_ENC_KEY minimal 32 karakter untuk AES-256");
  }
  return crypto.createHash("sha256").update(key).digest();
};

export { getEncryptionKey };
