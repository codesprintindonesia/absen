import crypto from "crypto";
import {
  encryptionMethod,
  secretIv,
  secretKey,
} from "../configs/aes.config.js";
import { sendResponse } from "../helpers/response.helper.js";
import HTTP_STATUS from "../constants/httpStatus.constant.js";
import logger from "../libraries/logger.library.js";

/* Generate secret hash with crypto to use for encryption */
const key = crypto.createHash("sha256").update(secretKey).digest();
const encryptionIV = crypto
  .createHash("sha256")
  .update(secretIv)
  .digest()
  .subarray(0, 16);

/* Encrypt data */
function encryptData(object) {
  let cipher = crypto.createCipheriv(encryptionMethod, key, encryptionIV);
  let encrypted = cipher.update(JSON.stringify(object), "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}

/* Decrypt data */
function decryptData(encryptedData) {
  let decipher = crypto.createDecipheriv(encryptionMethod, key, encryptionIV);
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
}

const aesMiddleware = () => {
  return (req, res, next) => {
    try {
      /* cek jika aes encryption adalah true dan encriptData tidak ada */
      if (process.env.AES_ENCRYPTION == "TRUE" && !req.body.encryptedData) {
        console.log(
          "Copy untuk Development ",
          JSON.stringify({
            encryptedData: encryptData(req.body),
          })
        );
      }

      if (req.method !== `GET`) {
        console.log("MASUK");
        const { encryptedData } = req.body; 

        if (!encryptedData && req.method != "GET") {
          throw new Error("encryptedData tidak ditemukan");
        }

        const afterDecrypt = decryptData(encryptedData);

        console.log("Setelah Decrypt ", afterDecrypt);
        console.log(`----------------------------`);

        req.body = afterDecrypt; /* Jika berhasil decrypt, timpa req.body */ 
      }

      next(); /* lanjutkan proses */
      
    } catch (error) {
      console.log(error.message);
      logger.error("AES Decryption failed", { error: error.message });
      return sendResponse(res, {
        httpCode: HTTP_STATUS.BAD_REQUEST,
        message: "AES Decryption failed: " + error.message,
      });
    }
  };
};

export { decryptData, encryptData };
export default aesMiddleware;
