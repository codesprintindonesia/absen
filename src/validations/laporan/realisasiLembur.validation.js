// src/validations/laporan/realisasiLembur.validation.js

import Joi from "joi";

// Base fields untuk realisasi lembur
const baseFields = {
  id_pegawai: Joi.string().max(10).trim().required(),
  periode_bulan_lembur: Joi.date().iso().required(),
  total_jam_lembur_bulanan: Joi.number().min(0).precision(2).required(),
  total_hari_terlambat_bulanan: Joi.number().integer().min(0).default(0),
  rata_menit_keterlambatan: Joi.number().min(0).precision(2).default(0),
  total_hari_tidak_hadir: Joi.number().integer().min(0).default(0),
  total_hari_kerja_efektif: Joi.number().integer().min(0).default(0),
  persentase_kehadiran: Joi.number().min(0).max(100).precision(2).default(0),
  is_data_final: Joi.boolean().default(false),
  tanggal_finalisasi_data: Joi.date().iso().allow(null).optional(),
  difinalisasi_oleh: Joi.string().max(10).trim().allow(null).optional(),
  nama_pegawai: Joi.string().max(100).trim().allow(null).optional(),
  kode_cabang: Joi.string().max(5).trim().allow(null).optional(),
  nama_cabang: Joi.string().max(100).trim().allow(null).optional(),
  id_divisi: Joi.string().max(5).trim().allow(null).optional(),
  nama_divisi: Joi.string().max(100).trim().allow(null).optional(),
  nama_jabatan_detail: Joi.string().max(255).trim().allow(null).optional(),
};

// CREATE validation
const createSchema = Joi.object({
  id: Joi.string().max(20).trim().required(),
  ...baseFields,
});

// UPDATE validation
const updateSchema = Joi.object({
  id_pegawai: Joi.string().max(10).trim().optional(),
  periode_bulan_lembur: Joi.date().iso().optional(),
  total_jam_lembur_bulanan: Joi.number().min(0).precision(2).optional(),
  total_hari_terlambat_bulanan: Joi.number().integer().min(0).optional(),
  rata_menit_keterlambatan: Joi.number().min(0).precision(2).optional(),
  total_hari_tidak_hadir: Joi.number().integer().min(0).optional(),
  total_hari_kerja_efektif: Joi.number().integer().min(0).optional(),
  persentase_kehadiran: Joi.number().min(0).max(100).precision(2).optional(),
  is_data_final: Joi.boolean().optional(),
  tanggal_finalisasi_data: Joi.date().iso().allow(null).optional(),
  difinalisasi_oleh: Joi.string().max(10).trim().allow(null).optional(),
  nama_pegawai: Joi.string().max(100).trim().allow(null).optional(),
  kode_cabang: Joi.string().max(5).trim().allow(null).optional(),
  nama_cabang: Joi.string().max(100).trim().allow(null).optional(),
  id_divisi: Joi.string().max(5).trim().allow(null).optional(),
  nama_divisi: Joi.string().max(100).trim().allow(null).optional(),
  nama_jabatan_detail: Joi.string().max(255).trim().allow(null).optional(),
}).min(1);

// READ validation (query parameters)
const readSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  id_pegawai: Joi.string().max(10).optional(),
  periode_bulan_lembur: Joi.date().iso().optional(),
  is_data_final: Joi.boolean().optional(),
  search: Joi.string().max(100).optional().allow(""),
});

// PARAMS validation
const paramsSchema = Joi.object({
  id: Joi.string().max(20).trim().required(),
});

export { createSchema, updateSchema, readSchema, paramsSchema };