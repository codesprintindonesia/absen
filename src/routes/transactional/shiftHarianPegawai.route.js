// src/routes/transactional/shiftHarianPegawai.route.js

import express from "express";
import generateShiftHarianPegawaiController  from "../../controllers/transactional/shiftHarianPegawai/generate.controller.js";
import createManualController from "../../controllers/transactional/shiftHarianPegawai/createManual.controller.js";
import updateRangeController from "../../controllers/transactional/shiftHarianPegawai/updateRange.controller.js";
import deleteRangeController from "../../controllers/transactional/shiftHarianPegawai/deleteRange.controller.js";
import getByRangeController from "../../controllers/transactional/shiftHarianPegawai/getByRange.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  generateShiftSchema,
  createManualSchema,
  updateRangeSchema,
  deleteRangeSchema,
  getRangeSchema,
} from "../../validations/transactional/shiftHarianPegawai.validation.js";

const router = express.Router();

/**
 * POST /api/transactional/shift-harian-pegawai/generate
 * Generate shift harian otomatis dari r_shift_pegawai
 */
router.post(
  "/generate",
  validate(generateShiftSchema),
  generateShiftHarianPegawaiController
);

/**
 * POST /api/transactional/shift-harian-pegawai/manual
 * Create shift harian manual untuk rentang tanggal
 * Use case: penugasan khusus, override jadwal
 */
router.post("/manual", validate(createManualSchema), createManualController);

/**
 * GET /api/transactional/shift-harian-pegawai/range
 * Get shift harian untuk rentang tanggal
 * Query params: id_pegawai (optional), tanggal_mulai, tanggal_akhir
 */
router.get("/range", validate(getRangeSchema, "query"), getByRangeController);

/**
 * PUT /api/transactional/shift-harian-pegawai/range
 * Update shift harian untuk rentang tanggal
 * Use case: cuti, izin, tukar shift, perubahan lokasi
 */
router.put("/range", validate(updateRangeSchema), updateRangeController);

/**
 * DELETE /api/transactional/shift-harian-pegawai/range
 * Delete shift harian untuk rentang tanggal
 * Use case: pembatalan jadwal, error data
 */
router.delete("/range", validate(deleteRangeSchema), deleteRangeController);

export default router;
