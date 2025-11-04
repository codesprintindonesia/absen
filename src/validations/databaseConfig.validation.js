import Joi from "joi";

/**
 * Validasi untuk isi PLAINTEXT JSON sebelum dienkripsi
 * (yang nantinya disimpan sebagai {fileName}.json.enc)
 *
 * Wajib:
 * - dbName, dbUser, dbPassword, dbHost, dbPort, dbDialect, fileName
 * Opsional:
 * - timezone, pool.*
 */
export const databaseFileConfigSchema = Joi.object({
  dbName: Joi.string().min(1).required(),
  dbUser: Joi.string().min(1).required(),
  dbPassword: Joi.string().allow("").required(),
  dbHost: Joi.alternatives().try(
    Joi.string().hostname(),
    Joi.string().ip({ version: ["ipv4", "ipv6"] })
  ).required(),
  dbPort: Joi.number().integer().min(1).max(65535).required(),
  dbDialect: Joi.string().valid("postgres","mysql","mariadb","sqlite","mssql").required(),
  fileName: Joi.string().regex(/^[a-zA-Z0-9._-]+$/).required(),
  timezone: Joi.string().pattern(/^[+-]\d{2}:\d{2}$/).default("+07:00"),
  pool: Joi.object({
    max: Joi.number().integer().min(0).default(20),
    min: Joi.number().integer().min(0).default(0),
    acquire: Joi.number().integer().min(0).default(30000),
    idle: Joi.number().integer().min(0).default(10000),
    evict: Joi.number().integer().min(0).default(1000),
  }).default({}),
}).required();

/** helper kecil untuk dipakai di setup/encrypt step */
export function validateDatabaseFileConfig(payload) {
  const { value, error } = databaseFileConfigSchema.validate(payload, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });
  if (error) {
    const msg = error.details.map(d => d.message).join("; ");
    throw new Error(`Config database tidak valid: ${msg}`);
  }
  return value;
}
