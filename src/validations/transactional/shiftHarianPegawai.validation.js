// File: src/validations/transactional/shiftHarianPegawai.validation.js
import Joi from "joi";

/**
 * Custom validator: Pastikan tanggal valid (bukan seperti 31 Februari)
 * Menggunakan .string() dulu baru validate, lalu convert ke date
 */
const validateRealDate = (value, helpers) => {
  // Value masih string karena kita validasi sebelum convert
  const parts = value.split("-");
  if (parts.length !== 3) {
    return helpers.error("date.format");
  }

  const [inputYear, inputMonth, inputDay] = parts.map(Number);

  // Validasi range basic
  if (inputMonth < 1 || inputMonth > 12) {
    return helpers.error("date.invalidMonth");
  }

  if (inputDay < 1 || inputDay > 31) {
    return helpers.error("date.invalidDay");
  }

  // Buat Date object untuk cek apakah tanggal valid
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return helpers.error("date.invalid");
  }

  // Get actual date parts setelah JavaScript normalisasi
  const actualYear = date.getFullYear();
  const actualMonth = date.getMonth() + 1;
  const actualDay = date.getDate();

  // Jika berbeda, berarti tanggal tidak valid (contoh: 31 Feb jadi 3 Mar)
  if (
    inputYear !== actualYear ||
    inputMonth !== actualMonth ||
    inputDay !== actualDay
  ) {
    // Hitung jumlah hari yang valid untuk bulan tersebut
    const maxDay = new Date(inputYear, inputMonth, 0).getDate();

    return helpers.error("date.notRealDate", {
      input: value,
      month: inputMonth,
      year: inputYear,
      maxDay: maxDay,
    });
  }

  return value;
};

/**
 * Custom validator: Pastikan tanggal_mulai dan tanggal_akhir dalam bulan & tahun yang sama
 */
const validateSameMonthYear = (value, helpers) => {
  const { tanggal_mulai } = helpers.state.ancestors[0];

  if (!tanggal_mulai) return value;

  const start = new Date(tanggal_mulai);
  const end = new Date(value);

  const startYear = start.getFullYear();
  const startMonth = start.getMonth();
  const endYear = end.getFullYear();
  const endMonth = end.getMonth();

  if (startYear !== endYear || startMonth !== endMonth) {
    return helpers.error("date.differentMonth", {
      startMonth: `${startYear}-${String(startMonth + 1).padStart(2, "0")}`,
      endMonth: `${endYear}-${String(endMonth + 1).padStart(2, "0")}`,
    });
  }

  return value;
};

/**
 * Schema untuk validasi tanggal dengan pattern YYYY-MM-DD
 */
const dateSchema = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .custom(validateRealDate);

/**
 * Validation schema untuk generate shift harian
 */
export const generateShiftSchema = Joi.object({
  tanggal_mulai: dateSchema.required().messages({
    "string.base": "Tanggal mulai harus berupa string",
    "string.pattern.base":
      "Tanggal mulai harus dalam format YYYY-MM-DD (contoh: 2025-01-15)",
    "date.format": "Format tanggal mulai tidak valid. Gunakan YYYY-MM-DD",
    "date.invalidMonth": "Bulan tidak valid. Bulan harus antara 01-12",
    "date.invalidDay": "Hari tidak valid. Hari harus antara 01-31",
    "date.invalid": "Tanggal mulai tidak valid",
    "date.notRealDate":
      "Tanggal mulai tidak valid! Bulan {{#month}} tahun {{#year}} hanya memiliki {{#maxDay}} hari. " +
      "Tanggal yang dibolehkan: 1 s/d {{#maxDay}}. Input Anda: {{#input}}",
    "any.required": "Tanggal mulai wajib diisi",
  }),

  tanggal_akhir: dateSchema
    .required()
    .custom(validateSameMonthYear)
    .custom((value, helpers) => {
      // Validasi tanggal_akhir >= tanggal_mulai
      const { tanggal_mulai } = helpers.state.ancestors[0];
      if (tanggal_mulai && new Date(value) < new Date(tanggal_mulai)) {
        return helpers.error("date.beforeStart");
      }
      return value;
    })
    .messages({
      "string.base": "Tanggal akhir harus berupa string",
      "string.pattern.base":
        "Tanggal akhir harus dalam format YYYY-MM-DD (contoh: 2025-01-31)",
      "date.format": "Format tanggal akhir tidak valid. Gunakan YYYY-MM-DD",
      "date.invalidMonth": "Bulan tidak valid. Bulan harus antara 01-12",
      "date.invalidDay": "Hari tidak valid. Hari harus antara 01-31",
      "date.invalid": "Tanggal akhir tidak valid",
      "date.notRealDate":
        "Tanggal akhir tidak valid! Bulan {{#month}} tahun {{#year}} hanya memiliki {{#maxDay}} hari. " +
        "Tanggal yang dibolehkan: 1 s/d {{#maxDay}}. Input Anda: {{#input}}",
      "date.beforeStart":
        "Tanggal akhir tidak boleh lebih kecil dari tanggal mulai",
      "date.differentMonth":
        "Tanggal mulai dan akhir harus dalam bulan dan tahun yang sama! " +
        "Mulai: {{#startMonth}}, Akhir: {{#endMonth}}",
      "any.required": "Tanggal akhir wajib diisi",
    }),

  id_pegawai: Joi.string().max(10).trim().optional().allow(null, "").messages({
    "string.max": "ID pegawai maksimal 10 karakter",
  }),

  mode: Joi.string()
    .valid("skip", "overwrite", "error")
    .optional()
    .default("error")
    .messages({
      "any.only": "Mode harus salah satu dari: skip, overwrite, error",
    }),
});

export const createManualSchema = Joi.object({
  id_pegawai: Joi.string().max(10).required(),
  id_personal: Joi.string().max(20).required(),
  nama_pegawai: Joi.string().max(100).required(),
  tanggal_mulai: Joi.date().iso().required(),
  tanggal_akhir: Joi.date().iso().min(Joi.ref("tanggal_mulai")).required(),
  id_shift_kerja: Joi.string().max(8).required(),
  id_lokasi_kerja: Joi.string().max(8).required(),
  id_pegawai_pengganti: Joi.string().max(10).allow(null).optional(),
  alasan_perubahan: Joi.string().allow(null, "").optional(),
  overwrite_existing: Joi.boolean().optional(),
});

export const updateRangeSchema = Joi.object({ 
  id_pegawai: Joi.string().required(),
  tanggal_mulai: Joi.date().iso().required(),
  tanggal_akhir: Joi.date().iso().min(Joi.ref('tanggal_mulai')).required(),
  id_shift_kerja_aktual: Joi.string().optional(),
  id_lokasi_kerja_aktual: Joi.string().optional(),
  id_pegawai_pengganti: Joi.string().optional().allow(null),
  nama_pengganti: Joi.string().optional().allow(null),
  id_personal_pengganti: Joi.string().optional().allow(null),
  alasan_perubahan: Joi.string().optional().allow(null), 
}).or(
  "id_shift_kerja_aktual",
  "id_lokasi_kerja_aktual",
  "id_pegawai_pengganti",
  "alasan_perubahan",
  "nama_pengganti",
  "id_personal_pengganti"
);

export const deleteRangeSchema = Joi.object({
  id_pegawai: Joi.string().max(10).required(),
  tanggal_mulai: Joi.date().iso().required(),
  tanggal_akhir: Joi.date().iso().min(Joi.ref("tanggal_mulai")).required(),
  alasan_hapus: Joi.string().allow(null, "").optional(),
});

export const getRangeSchema = Joi.object({
  id_pegawai: Joi.string().max(10).optional(),
  tanggal_mulai: Joi.date().iso().required(),
  tanggal_akhir: Joi.date().iso().min(Joi.ref("tanggal_mulai")).required(),
}); 
