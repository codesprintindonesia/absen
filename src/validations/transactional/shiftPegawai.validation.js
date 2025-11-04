// src/validations/transaction/shiftPegawai.validation.js
import Joi from "joi";

// Skema ID
const idSchema = Joi.string().max(20).trim().required();

// Tanggal dalam format YYYY‑MM‑DD
const dateSchema = Joi.date().iso();

// Aturan dasar kolom
const baseFields = {
  id_pegawai: Joi.string().max(10).trim().required(),
  id_shift_kerja: Joi.string().max(8).trim().allow(null),
  id_shift_group: Joi.string().max(8).trim().allow(null),
  tanggal_mulai: dateSchema.required(),
  tanggal_akhir: dateSchema.allow(null),
  is_active: Joi.boolean().optional()
};

// Pastikan salah satu dari id_shift_kerja atau id_shift_group harus diisi
const shiftPairRule = Joi.object({
  id_shift_kerja: baseFields.id_shift_kerja,
  id_shift_group: baseFields.id_shift_group
}).or('id_shift_kerja', 'id_shift_group');

// Skema create
const createSchema = Joi.object({
  id: idSchema,
  ...baseFields
}).concat(shiftPairRule);

// Skema update – minimal satu field dapat diubah
const updateSchema = Joi.object(baseFields).concat(shiftPairRule).min(1);

// Skema read (daftar)
const readSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  id_pegawai: Joi.string().max(10).optional(),
  id_shift_kerja: Joi.string().max(8).optional(),
  id_shift_group: Joi.string().max(8).optional(),
  is_active: Joi.boolean().optional(),
  q: Joi.string().max(100).optional().allow("")
});

// Skema params (:id)
const paramsSchema = Joi.object({ id: idSchema });

export { createSchema, updateSchema, readSchema, paramsSchema };
