// src/validations/relational/shiftGroupDetail.validation.js
import Joi from "joi";

// id maksimal 12 karakter, wajib
const idSchema = Joi.string().max(12).trim().required();

// base fields
const baseFields = {
  id_shift_group: Joi.string().max(8).trim().required(),
  id_shift_kerja: Joi.string().max(8).trim().required(),  
};

// validasi create
const createSchema = Joi.object({
  id: idSchema,
  ...baseFields,
});

// validasi update: minimal satu field diisi
const updateSchema = Joi.object({
  ...baseFields,
}).min(1);

// validasi read (list)
const readSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  id_shift_group: Joi.string().max(8).optional(),
  id_shift_kerja: Joi.string().max(8).optional(),  
});

// validasi params (:id)
const paramsSchema = Joi.object({
  id: idSchema,
});

// validasi header (opsional)
const headerSchema = Joi.object({
  "x-client-version": Joi.string().optional(),
  "x-device-id": Joi.string().optional(),
  authorization: Joi.string().pattern(/^Bearer .+/).optional(),
}).unknown(true);

export {
  createSchema,
  updateSchema,
  readSchema,
  paramsSchema,
  headerSchema,
};
