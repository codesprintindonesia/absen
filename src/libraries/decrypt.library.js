import crypto from "crypto";
import { ALGO, IV_LEN, TAG_LEN } from "../configs/crypto.config.js";
import { getEncryptionKey } from "../helpers/crypto.helper.js";

export function decryptString(b64) {
  const raw = Buffer.from(b64, "base64");
  const iv = raw.subarray(0, IV_LEN);
  const tag = raw.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ciphertext = raw.subarray(IV_LEN + TAG_LEN);

  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}
