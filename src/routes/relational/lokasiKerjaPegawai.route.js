import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createSchema,
  updateSchema,
  readSchema,
  paramsSchema,
} from "../../validations/relational/lokasiKerjaPegawai.validation.js";
import createController from "../../controllers/relational/lokasiKerjaPegawai/create.controller.js";
import readController from "../../controllers/relational/lokasiKerjaPegawai/read.controller.js";
import getByIdController from "../../controllers/relational/lokasiKerjaPegawai/getById.controller.js";
import updateController from "../../controllers/relational/lokasiKerjaPegawai/update.controller.js";
import deleteController from "../../controllers/relational/lokasiKerjaPegawai/delete.controller.js";

const router = Router();

router.get("/", validate(readSchema, "query"), readController);
router.post("/", validate(createSchema), createController);
router.get("/:id", validate(paramsSchema, "params"), getByIdController);
router.put(
  "/:id",
  validate(paramsSchema, "params"),
  validate(updateSchema),
  updateController
);
router.delete("/:id", validate(paramsSchema, "params"), deleteController);

export default router;
