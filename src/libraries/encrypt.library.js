import crypto from "crypto";
import { ALGO, IV_LEN } from "../configs/crypto.config.js";
import { getEncryptionKey } from "../helpers/crypto.helper.js";

export function encryptString(plain) {
  const iv = crypto.randomBytes(IV_LEN);
  const key = getEncryptionKey();

  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.aktual()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}
