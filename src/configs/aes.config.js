/*
 * Copyright (c) 2023 AchmadChaidirS
 *
 * Author   : AchmadChaidirS
 * Filename : aes.config.js
 * Date     : 2023-06-02
 * Time     : 09:19:57
 * Updated  : 2025-01-13 - Moved secrets to environment variables for security
 */

// SECURITY: Secrets moved to environment variables
// Set these in your .env file:
// AES_SECRET_KEY=your-32-character-secret-key-here
// AES_SECRET_IV=your-16-character-iv-here

const secretKey = process.env.AES_SECRET_KEY || (() => {
  throw new Error('AES_SECRET_KEY environment variable is required');
})();

const secretIv = process.env.AES_SECRET_IV || (() => {
  throw new Error('AES_SECRET_IV environment variable is required');
})();

const encryptionMethod = `aes-256-cbc`;

// Validate key lengths
if (secretKey.length !== 32) {
  throw new Error('AES_SECRET_KEY must be exactly 32 characters for AES-256');
}

if (secretIv.length !== 16) {
  throw new Error('AES_SECRET_IV must be exactly 16 characters');
}

export { secretKey, secretIv, encryptionMethod };
