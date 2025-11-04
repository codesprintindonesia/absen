import Joi from "joi";

import {
  STATUS_VALIDASI,
  SOURCE_ABSENSI,
} from "../../models/transactional/logRawAbsensi.model.js";

const idSchema = Joi.string().max(25).trim().required();

const baseFields = {
  id_pegawai: Joi.string().max(10).trim().required(),
  waktu_log: Joi.date().iso().required(), // timestamp ISO
  id_device: Joi.string().max(50).trim().allow(null),
  koordinat_gps: Joi.string().max(50).trim().allow(null),
  id_lokasi_kerja: Joi.string().max(8).trim().allow(null),
  is_validasi_geofence: Joi.boolean().default(false),
  jarak_dari_lokasi: Joi.number().precision(2).allow(null),
  akurasi_gps: Joi.number().precision(2).allow(null),
  path_bukti_foto: Joi.string().max(255).trim().allow(null),
  qr_hash: Joi.string().max(255).trim().allow(null),
  keterangan_log: Joi.string().allow("", null),
  status_validasi: Joi.string()
    .valid(...STATUS_VALIDASI)
    .default("VALID"),
  nama_pegawai: Joi.string().max(100).trim().allow(null),
  kode_cabang: Joi.string().max(5).trim().allow(null),
  nama_cabang: Joi.string().max(100).trim().allow(null),
  nama_jabatan_detail: Joi.string().max(255).trim().allow(null),
  source_absensi: Joi.string()
    .valid(...SOURCE_ABSENSI)
    .required(),
};

const createSchema = Joi.object({
  id: idSchema,
  ...baseFields,
});

const updateSchema = Joi.object({
  id_pegawai: Joi.string().max(10).trim(),
  waktu_log: Joi.date().iso(),
  id_device: Joi.string().max(50).trim().allow(null),
  koordinat_gps: Joi.string().max(50).trim().allow(null),
  id_lokasi_kerja: Joi.string().max(8).trim().allow(null),
  is_validasi_geofence: Joi.boolean(),
  jarak_dari_lokasi: Joi.number().precision(2).allow(null),
  akurasi_gps: Joi.number().precision(2).allow(null),
  path_bukti_foto: Joi.string().max(255).trim().allow(null),
  qr_hash: Joi.string().max(255).trim().allow(null),
  keterangan_log: Joi.string().allow(""),
  status_validasi: Joi.string().valid(...STATUS_VALIDASI),
  nama_pegawai: Joi.string().max(100).trim().allow(null),
  kode_cabang: Joi.string().max(5).trim().allow(null),
  nama_cabang: Joi.string().max(100).trim().allow(null),
  nama_jabatan_detail: Joi.string().max(255).trim().allow(null),
  source_absensi: Joi.string().valid(...SOURCE_ABSENSI),
}).min(1);

const readSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),

  id_pegawai: Joi.string().max(10).trim().optional(),
  id_lokasi_kerja: Joi.string().max(8).trim().optional(),
  source_absensi: Joi.string()
    .valid(...SOURCE_ABSENSI)
    .optional(),
  status_validasi: Joi.string()
    .valid(...STATUS_VALIDASI)
    .optional(),

  // range by timestamp
  waktu_log_from: Joi.date().iso().optional(),
  waktu_log_to: Joi.date().iso().optional(),

  // range by DATE(waktu_log)
  tanggal_from: Joi.date().iso().optional(),
  tanggal_to: Joi.date().iso().optional(),

  // 🔎 advanced search
  search: Joi.string().trim().allow("").optional(),
  search_fields: Joi.array()
    .items(
      Joi.string().valid(
        "keterangan_log",
        "qr_hash",
        "id_device",
        "koordinat_gps",
        "nama_pegawai",
        "kode_cabang",
        "nama_cabang",
        "nama_jabatan_detail",
        "source_absensi",
        "status_validasi"
      )
    )
    .max(10)
    .optional(),
});

const paramsSchema = Joi.object({
  id: idSchema,
});

export { createSchema, updateSchema, readSchema, paramsSchema };
