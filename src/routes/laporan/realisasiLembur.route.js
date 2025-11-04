// src/routes/laporan/realisasiLembur.route.js

import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createSchema,
  updateSchema,
  readSchema,
  paramsSchema,
} from "../../validations/laporan/realisasiLembur.validation.js";
import {
  generateBulananSchema,
  generateBulananAllSchema,
} from "../../validations/laporan/realisasiLemburGenerate.validation.js";

import createController from "../../controllers/laporan/realisasiLembur/create.controller.js";
import readController from "../../controllers/laporan/realisasiLembur/read.controller.js";
import getByIdController from "../../controllers/laporan/realisasiLembur/getById.controller.js";
import updateController from "../../controllers/laporan/realisasiLembur/update.controller.js";
import deleteController from "../../controllers/laporan/realisasiLembur/delete.controller.js"; 

import generateBulananController from "../../controllers/laporan/realisasiLembur/generateBulanan.controller.js";
import generateBulananAllPegawaiController from "../../controllers/laporan/realisasiLembur/generateBulananAllPegawai.controller.js";

const router = Router();

// Endpoint generate (harus di atas /:id agar tidak tertangkap sebagai params)
router.post("/generate", validate(generateBulananSchema), generateBulananController);
router.post("/generate-all", validate(generateBulananAllSchema), generateBulananAllPegawaiController);

// CRUD endpoints
router.get("/", validate(readSchema, "query"), readController);
router.post("/", validate(createSchema), createController);
router.get("/:id", validate(paramsSchema, "params"), getByIdController);
router.put("/:id", validate(paramsSchema, "params"), validate(updateSchema), updateController);
router.delete("/:id", validate(paramsSchema, "params"), deleteController);

export default router;