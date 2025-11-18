import Joi from "joi";

/**
 * Validasi environment yang dipakai saat runtime server
 */
export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "staging", "production")
    .default("development"),
  
  PORT: Joi.number()
    .integer()
    .min(1)
    .max(65535)
    .default(3000),

  // Database config file: src/files/databases/{DATABASE}.json.enc
  DATABASE: Joi.string()
    .regex(/^[a-zA-Z0-9._-]+$/)
    .required(),

  // Encryption key minimal 32 char
  CONFIG_ENC_KEY: Joi.string()
    .min(32)
    .required(),

  DB_TIMEZONE: Joi.string()
    .pattern(/^[+-]\d{2}:\d{2}$/)
    .default("+07:00"),

  // Database pool override (optional)
  DB_POOL_MAX: Joi.number().integer().min(0),
  DB_POOL_MIN: Joi.number().integer().min(0),
  DB_POOL_ACQUIRE: Joi.number().integer().min(0),
  DB_POOL_IDLE: Joi.number().integer().min(0),
  DB_POOL_EVICT: Joi.number().integer().min(0),

  // Logging configuration
  LOG_ROOT: Joi.string().default("logs"),
  LOG_LEVEL: Joi.string()
    .valid("error", "warn", "info", "http", "verbose", "debug", "silly")
    .default("info"),
  LOG_FILE_MAXSIZE: Joi.string().default("10m"),

  // Cron Jobs configuration
  CRON_ENABLED: Joi.string()
    .valid("true", "false", "TRUE", "FALSE")
    .default("true"),

  // Individual cron job controls (optional)
  CRON_REKONSILIASI_HARIAN_ENABLED: Joi.string()
    .valid("true", "false", "TRUE", "FALSE")
    .optional(),

  CRON_GENERATE_LEMBUR_BULANAN_ENABLED: Joi.string()
    .valid("true", "false", "TRUE", "FALSE")
    .optional(),

  CRON_GENERATE_SHIFT_BULANAN_ENABLED: Joi.string()
    .valid("true", "false", "TRUE", "FALSE")
    .optional(),

  CRON_TEST_CRON_ENABLED: Joi.string()
    .valid("true", "false", "TRUE", "FALSE")
    .optional(),

}).unknown(true); // Allow other env vars

export function validateEnv(envObj = process.env) {
  const { value, error } = envSchema.validate(envObj, {
    abortEarly: false,
  });
  
  if (error) {
    const msg = error.details.map((d) => d.message).join("; ");
    throw new Error(`ENV tidak valid: ${msg}`);
  }
  
  return value;
}