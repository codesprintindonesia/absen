// src/routes/transactional/absensiHarian.route.js
import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { prosesSchema } from "../../validations/transactional/absensiHarian/rekonsiliasi.validation.js";
import rekonsiliasiController from "../../controllers/transactional/absensiHarian/rekonsiliasi.controller.js";

const router = Router();
 
router.post(
  "/rekonsiliasi",
  validate(prosesSchema, "body"),
  rekonsiliasiController
);

export default router;
