/*
 * Copyright (c) 2022 AchmadChaidirS
 *
 * Author   : AchmadChaidirS
 * Filename : asymetricSignature.middleware.js
 * Date     : 2022-12-13
 * Time     : 09:40:02
 */

import crypto from "crypto";
import Crypto from "crypto-js";
import { publicKey, privateKey } from "../configs/rsa.config.js";
import { sendResponse } from "../helpers/response.helper.js";
import HTTP_STATUS from "../constants/httpStatus.constant.js";
import logger from "../libraries/logger.library.js";
const asymetricSignatureMiddleware = () => {
  return (req, res, next) => {
    try {
      if (!req.header("X-SIGNATURE") || !req.header("X-TIMESTAMP")) {
        throw new Error(
          "Service Absensi - Header X-SIGNATURE atau X-TIMESTAMP tidak ditemukan"
        ); /* Header X-SIGNATURE atau X-TIMESTAMP tidak ditemukan */
      }

      const httpMethod = req.method;
      const endpointUrl = req.originalUrl;
      const timeStamp = req.header("X-TIMESTAMP");

      console.log("Inilah Endpoint", endpointUrl);

      console.log("TIMESTAMP", timeStamp);

      const signature = Buffer.from(
        req.header("X-SIGNATURE"),
        "base64"
      ); /* Proses ini yaitu untuk mendecode_base64 signature yang dikirim oleh client, lalu signature ini yang akan didecrypt lalu dibandingkan dengan stringToSign yang dikirim oleh client */

      const minify = JSON.stringify(req.body);
      const hashDigest = Crypto.SHA256(minify).toString();
      const hexEncode = Buffer.from(hashDigest, "utf8").toString("hex");
      const lowerCase = hexEncode.toLowerCase();


      const stringToSign = `${httpMethod}:${endpointUrl}:${lowerCase}:${timeStamp}`;
      console.log(`stringToSign AWAL`, stringToSign);

      /* Encrypt the data dari stringToSign menggunakan public key */
      const encryptedData = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        /* Convert the data string to a buffer using `Buffer.from` */
        Buffer.from(stringToSign)
      );

      console.log(`-------------- COPY SIGNATURE --------------`);
      console.log(encryptedData.toString("base64"));

      /* Decrypt signature menggunakan private key, lalu hasil dari decrypt tersebut harus sama dengan stringToSign */
      const decryptedData = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        signature
      );

      console.log(`----------------------------`);
      console.log("stringToSign ", stringToSign);
      console.log(`----------------------------`);
      console.log("Hasil dari Decrypt Signature", decryptedData.toString());
      console.log(`----------------------------`);

      /* Bandingkan hasil dari decrypt signature  dengan stringToSign */
      if (decryptedData.toString() !== stringToSign) {
        console.log(decryptedData.toString());
        console.log(stringToSign);
        httpCode = 400;
        throw new Error(
          "Service Cuti - Signature tidak sesuai"
        ); /*Signature tidak sesuai */
      }
      /* Jika signature sesuai, tidak usah dilog 
      logger.info("Sign Signature", logFormat(req, response(200, "OK")));
      */

      next(); /* Jika signature sesuai, lanjutkan proses */
    } catch (error) {
      logger.error("Asymetric Signature verification failed", {
        error: error.message,
      });
      sendResponse(res, {
        httpCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  };
};

export default asymetricSignatureMiddleware;
