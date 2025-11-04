// src/validations/master/hariLibur.validation.js
import Joi from "joi"; 

// Schema dasar untuk field hari libur
const baseFields = {
  tanggal: Joi.date().iso().required(),
  nama: Joi.string().max(100).trim().required(), 
  keterangan: Joi.string().allow(null, "").optional(),
};

// CREATE validation
const createSchema = Joi.object({
  ...baseFields,
});

// UPDATE validation
const updateSchema = Joi.object({
  nama: Joi.string().max(100).trim().optional(), 
  keterangan: Joi.string().allow(null, "").optional(),
}).min(1);

// LIST validation (untuk query parameters)
const readSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20), 
  search: Joi.string().max(100).optional().allow(''),
});

// PARAMS validation (untuk :tanggal di URL)
const paramsSchema = Joi.object({
  tanggal: Joi.date().iso().required(),
});

// Export semua schemas
export { 
  createSchema, 
  updateSchema, 
  readSchema,
  paramsSchema
};