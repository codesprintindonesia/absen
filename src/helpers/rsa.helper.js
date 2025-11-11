import crypto from "crypto";
import Crypto from "crypto-js";
import { publicKey as defaultPublicKey } from "../configs/rsa.config.js";

export const generateSignature = (method, endpoint, data, timestamp, publicKey = defaultPublicKey) => { 

  const minify = JSON.stringify(data);
  const hashDigest = Crypto.SHA256(minify).toString();
  const hexEncode = Buffer.from(hashDigest, "utf8").toString("hex");
  const lowerCase = hexEncode.toLowerCase();

  console.log("HASIL DARI generateSignature", lowerCase);
  const stringToSign = `${method}:${endpoint}:${lowerCase}:${timestamp}`;

  const encryptedData = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(stringToSign)
  );

  return encryptedData.toString("base64");
};
