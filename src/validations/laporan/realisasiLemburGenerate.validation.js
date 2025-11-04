// src/validations/laporan/realisasiLemburGenerate.validation.js

import Joi from "joi";

// Validation untuk generate satu pegawai
const generateBulananSchema = Joi.object({
  id_pegawai: Joi.string().max(10).trim().required(),
  periode_bulan_lembur: Joi.date().iso().required(),
});

// Validation untuk generate semua pegawai
const generateBulananAllSchema = Joi.object({
  periode_bulan_lembur: Joi.date().iso().required(),
});

export { generateBulananSchema, generateBulananAllSchema };