// src/routes/master/lokasiKerja.route.js
import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createSchema,
  readSchema,
  paramsSchema,
  updateSchema,
} from "../../validations/master/lokasiKerja.validation.js";
import createController from "../../controllers/master/lokasiKerja/create.controller.js";
import readController from "../../controllers/master/lokasiKerja/read.controller.js";
import updateController from "../../controllers/master/lokasiKerja/update.controller.js";
import getByIdController from "../../controllers/master/lokasiKerja/getById.controller.js";
import deleteController from '../../controllers/master/lokasiKerja/delete.controllers.js';
import checkDeleteImpactController from '../../controllers/master/lokasiKerja/checkDeleteImpact.controllers.js';

const router = Router();

/**
 * GET /lokasi-kerja
 * Get read lokasi kerja dengan filtering dan pagination
 */
router.get("/", validate(readSchema, "query"), readController);

/**
 * POST /lokasi-kerja
 * Create lokasi kerja baru
 */
router.post("/", validate(createSchema), createController);

/** PUT /lokasi-kerja
 * Update lokasi kerja
 */
router.put(
  "/:id",
  validate(paramsSchema, "params"),
  validate(updateSchema),
  updateController
);

/**
 * GET /lokasi-kerja/:id (NEW)
 * Get lokasi kerja by ID
 */
router.get('/:id', validate(paramsSchema, 'params'), getByIdController);

/**
 * GET /lokasi-kerja/:id/delete-impact (NEW)
 * Check delete impact analysis
 */
router.get('/:id/delete-impact', validate(paramsSchema, 'params'), checkDeleteImpactController);

/**
 * DELETE /lokasi-kerja/:id (NEW)
 * Hard delete lokasi kerja
 */
router.delete('/:id', validate(paramsSchema, 'params'), deleteController);


export default router;
