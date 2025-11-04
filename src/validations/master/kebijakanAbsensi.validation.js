// src/validations/master/kebijakanAbsensi.validation.js
import Joi from "joi";  

// Reusable pieces
const idSchema = Joi.string().max(8).trim().required();
const hhmmss = Joi.string()
  .pattern(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/) // HH:mm:ss 00..23
  .message("jam_cut_off_hari harus format HH:mm:ss");

// Base fields mengikuti kolom tabel
const baseFields = { 
  nama: Joi.string().max(100).trim().required(), 

  toleransi_keterlambatan: Joi.number().integer().min(0).optional(), // default 15

  min_jam_kerja_full_day: Joi.number()
    .precision(2)
    .custom((value, helpers) => {
      if (value != null && Number(value) <= 0) {
        return helpers.error("any.invalid");
      }
      if (value != null && value >= 100) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "positif & masuk akal")
    .messages({
      "any.invalid": "min_jam_kerja_full_day harus > 0 dan < 100",
    })
    .optional(), // default 8.00

  aturan_potongan_terlambat: Joi.alternatives(
    Joi.object().unknown(true),
    Joi.array().items(Joi.any())
  )
    .allow(null)
    .optional(),

  kebijakan_lembur_otomatis: Joi.alternatives(
    Joi.object().unknown(true),
    Joi.array().items(Joi.any())
  )
    .allow(null)
    .optional(),

  jam_cut_off_hari: hhmmss.allow(null).optional(), // default '23:59:59'
 

  is_default: Joi.boolean().optional(), // default false
  is_active: Joi.boolean().optional(), // default true
};

// CREATE: id wajib (+ base)
const createSchema = Joi.object({
  id: idSchema,
  ...baseFields,
});

// UPDATE: minimal 1 field dari base (id ada di params)
const updateSchema = Joi.object({
  ...baseFields,
}).min(1);

// LIST (query): pagination + filter umum
const readSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20), 
  is_active: Joi.boolean().optional(),
  is_default: Joi.boolean().optional(),

  // cari by teks (nama tergantung implementasi)
  search: Joi.string().max(100).optional().allow(""),
});

// PARAMS (/:id)
const paramsSchema = Joi.object({
  id: idSchema,
});

// HEADER (opsional, konsisten dengan contohmu)
const headerSchema = Joi.object({
  "x-client-version": Joi.string().optional(),
  "x-device-id": Joi.string().optional(),
  authorization: Joi.string().pattern(/^Bearer .+/).optional(),
}).unknown(true);

// Export
export { createSchema, updateSchema, readSchema, paramsSchema, headerSchema };
