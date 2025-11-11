import { instanceMSDM } from "../../configs/axios.config.js";
import { generateSignature } from "../../helpers/rsa.helper.js";
import { encryptData } from "../../middlewares/aes.middleware.js";
import { config } from "dotenv";
import fs from "fs"; 

config();

/**
 * Helper function to perform API requests with encryption and signature.
 *
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} endpoint - API endpoint
 * @param {object} dataBody - Request body
 * @returns {Promise} - Returns the response data
 */

export const msdmService = async (method, endpoint, dataBody = {}) => {
  try {
    // Encrypt data if AES encryption is enabled
    if (process.env.MSDM_AES_ENCRYPTION == "TRUE" && method != "GET") {
      dataBody = { encryptedData: encryptData(dataBody) };
    }

    const publicKey = fs.readFileSync("src/files/asymetric/msdm/publicKey.pem"); 

    // Generate signature if asymmetric signature is enabled
    const xTimeStamp = Date.now();
    const xSignature = generateSignature(method, endpoint, dataBody, xTimeStamp, publicKey);

    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
      ...(process.env.MSDM_ASYMETRIC_SIGNATURE === "TRUE" && {
        "X-SIGNATURE": xSignature,
        "X-TIMESTAMP": xTimeStamp,
      }),
    };

    // Perform the API request
    const response = await instanceMSDM({
      method,
      url: endpoint,
      data: dataBody,
      headers,
    });

    return response.data;
  } catch (error) {
    const { message } = error.response?.data || error;
    throw new Error(`Error in API request to ${endpoint} - ${message}`);
  }
};
