// src/validations/master/shiftGroup.validation.js
import Joi from "joi";

// Skema ID: string maksimal 8 karakter, wajib ada
const idSchema = Joi.string().max(8).trim().required();

// Kolom-kolom utama shift group (base fields)
const baseFields = {
  // Nama shift group: wajib, maksimal 100 karakter
  nama: Joi.string().max(100).trim().required(),

  // Durasi rotasi dalam minggu: integer minimal 1 (default 1 di DB):contentReference[oaicite:1]{index=1}
  durasi_rotasi_hari: Joi.number().integer().min(1).optional(),

  // Keterangan: string atau null, opsional
  keterangan: Joi.string().allow(null, "").optional(),

  // Status aktif: boolean opsional (default true)
  is_active: Joi.boolean().optional(),
};

// VALIDASI CREATE
// id wajib dikirim, semua baseFields valid
const createSchema = Joi.object({
  id: idSchema,
  ...baseFields,
});

// VALIDASI UPDATE
// id berada di params, minimal satu field dari baseFields harus ada:contentReference[oaicite:2]{index=2}
// Ini mencegah update tanpa perubahan apa pun.
const updateSchema = Joi.object({
  ...baseFields,
}).min(1);

// VALIDASI READ (query parameters) untuk listing shift group
const readSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  is_active: Joi.boolean().optional(),        // filter status aktif
  search: Joi.string().max(100).optional().allow(""), // pencarian teks pada nama/keterangan
});

// VALIDASI PARAMS (:id) untuk operasi GET/PUT/DELETE by ID
const paramsSchema = Joi.object({
  id: idSchema,
});

// VALIDASI HEADER (opsional, dapat ditambahkan sesuai kebutuhan)
const headerSchema = Joi.object({
  "x-client-version": Joi.string().optional(),
  "x-device-id": Joi.string().optional(),
  authorization: Joi.string().pattern(/^Bearer .+/).optional(),
}).unknown(true); // Terima header lain tanpa validasi

export {
  createSchema,
  updateSchema,
  readSchema,
  paramsSchema,
  headerSchema,
};
