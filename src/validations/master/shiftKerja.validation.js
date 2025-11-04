// src/validations/master/shiftKerja.validation.js
import Joi from "joi"; 

// Skema id
const idSchema = Joi.string().max(8).trim().required();

// Regex jam (HH:mm:ss)
const hhmmss = Joi.string()
  .pattern(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/)
  .message("format jam harus HH:mm:ss");

// Base fields
const baseFields = { 
  nama: Joi.string().max(50).trim().required(),
  jam_masuk: hhmmss.required(),
  jam_pulang: hhmmss.required(),
  durasi_istirahat: Joi.number().integer().min(0).max(240).optional(),
  // hari_kerja berupa array angka 1–7 atau objek JSON lain sesuai desain
  hari_kerja: Joi.alternatives(
    Joi.array().items(Joi.number().integer().min(1).max(7)),
    Joi.object().unknown(true)
  ).required(), 
  toleransi_keterlambatan: Joi.number().integer().min(0).optional(),
  keterangan: Joi.string().allow(null, "").optional(),
  is_active: Joi.boolean().optional(),
};

// CREATE
const createSchema = Joi.object({
  id: idSchema,
  ...baseFields,
});

// UPDATE – minimal satu field harus diisi
const updateSchema = Joi.object({
  ...baseFields,
}).min(1);

// READ (list)
const readSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20), 
  is_active: Joi.boolean().optional(),
  q: Joi.string().max(100).optional().allow(""),
});

// PARAMS (:id)
const paramsSchema = Joi.object({ id: idSchema });

// HEADER (opsional)
const headerSchema = Joi.object({
  "x-client-version": Joi.string().optional(),
  "x-device-id": Joi.string().optional(),
  authorization: Joi.string()
    .pattern(/^Bearer .+/)
    .optional(),
}).unknown(true);

export { createSchema, updateSchema, readSchema, paramsSchema, headerSchema };
