// src/validations/master/lokasiKerja.validation.js
import Joi from "joi";
import { TYPE_LOKASI } from "../../models/master/lokasiKerja.model.js";

// Schema dasar untuk field lokasi kerja
const idSchema = Joi.string().max(8).trim().required();

const baseFields = {
  kode_referensi: Joi.string().max(20).trim().required(),
  type_lokasi: Joi.string().valid(...TYPE_LOKASI).required(),
  nama: Joi.string().max(100).trim().required(),
  alamat: Joi.string().allow(null, "").optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  radius: Joi.number().integer().min(1).max(1000).required(),
  is_active: Joi.boolean().optional(),
  keterangan: Joi.string().allow(null, "").optional(),
  cabang_induk: Joi.string().max(3).allow(null, "").optional(),
  nama_cabang_induk: Joi.string().max(100).allow(null, "").optional(),
};

// CREATE validation
const createSchema = Joi.object({
  ...baseFields,
  id: idSchema,
});

// UPDATE validation
const updateSchema = Joi.object({
  ...baseFields, // id ada di params
}).min(1);

// LIST validation (untuk query parameters)
const readSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type_lokasi: Joi.string().valid(...TYPE_LOKASI).optional(),
  is_active: Joi.boolean().optional(),
  search: Joi.string().max(100).optional().allow(''),
});

// PARAMS validation (untuk :id di URL)
const paramsSchema = Joi.object({
  id: idSchema,
});

// HEADER validation example (jika diperlukan)
const headerSchema = Joi.object({
  'x-client-version': Joi.string().optional(),
  'x-device-id': Joi.string().optional(),
  'authorization': Joi.string().pattern(/^Bearer .+/).optional(),
  // Joi akan ignore headers lain yang tidak didefinisikan
}).unknown(true);

// Export semua schemas
export { 
  createSchema, 
  updateSchema, 
  readSchema,
  paramsSchema,
  headerSchema
};