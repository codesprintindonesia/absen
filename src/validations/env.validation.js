import Joi from "joi";

/**
 * Validasi environment yang dipakai saat runtime server
 * (bukan isi file config DB).
 */
export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "test", "staging", "production")
    .default("development"),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),

  // menentukan file terenkripsi yang dipakai: src/files/databases/{DATABASE}.json.enc
  DATABASE: Joi.string()
    .regex(/^[a-zA-Z0-9._-]+$/)
    .required(),

  // kunci minimal 32 char (akan di-hash ke 32 byte oleh helper)
  CONFIG_ENC_KEY: Joi.string().min(32).required(),

  DB_TIMEZONE: Joi.string()
    .pattern(/^[+-]\d{2}:\d{2}$/)
    .default("+07:00"),

  // override pool via env (opsional)
  DB_POOL_MAX: Joi.number().integer().min(0),
  DB_POOL_MIN: Joi.number().integer().min(0),
  DB_POOL_ACQUIRE: Joi.number().integer().min(0),
  DB_POOL_IDLE: Joi.number().integer().min(0),
  DB_POOL_EVICT: Joi.number().integer().min(0),

  // Signoz Configuration
  SIGNOZ_ENABLED: Joi.boolean().default(false),
  SIGNOZ_OTLP_ENDPOINT: Joi.string().when("SIGNOZ_ENABLED", {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  SIGNOZ_SERVICE_NAME: Joi.string().default("absensi-msdm"),
  SIGNOZ_SERVICE_VERSION: Joi.string().default("1.0.0"),
  SIGNOZ_ENVIRONMENT: Joi.string()
    .valid("development", "staging", "production")
    .default("development"),
  SIGNOZ_SAMPLE_RATE: Joi.number().min(0).max(1).default(1.0),
  SIGNOZ_LOG_LEVEL: Joi.string()
    .valid("error", "warn", "info", "debug")
    .default("info"),
}).unknown(true); // biarkan env lain tetap lolos

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
