// src/validations/transactional/absensiHarian/rekonsiliasi.validation.js
import Joi from "joi";

/**
 * Validation schema untuk proses rekonsiliasi absensi harian
 */
const prosesSchema = Joi.object({
  tanggal: Joi.date()
    .iso()
    .max('now')
    .required()
    .messages({
      'date.base': 'Tanggal harus berupa tanggal yang valid',
      'date.format': 'Format tanggal harus YYYY-MM-DD',
      'date.max': 'Tanggal tidak boleh di masa depan',
      'any.required': 'Tanggal wajib diisi'
    })
});

export { prosesSchema };