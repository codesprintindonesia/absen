import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createSchema,
  updateSchema,
  readSchema,
  paramsSchema,
} from "../../validations/transactional/logRawAbsensi.validation.js";

import createController from "../../controllers/transactional/logRawAbsensi/create.controller.js";
import readController from "../../controllers/transactional/logRawAbsensi/read.controller.js";
import getByIdController from "../../controllers/transactional/logRawAbsensi/getById.controller.js";
import updateController from "../../controllers/transactional/logRawAbsensi/update.controller.js";
import deleteController from "../../controllers/transactional/logRawAbsensi/delete.controller.js";

const router = Router();

router.get("/", validate(readSchema), readController);
router.post("/", validate(createSchema), createController);
router.get("/:id", validate(paramsSchema, "params"), getByIdController);
router.put("/:id", validate(paramsSchema, "params"), validate(updateSchema), updateController);
router.delete("/:id", validate(paramsSchema, "params"), deleteController);

export default router;
