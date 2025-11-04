import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createSchema,
  updateSchema,
  readSchema,
  paramsSchema,
} from "../../validations/relational/shiftPegawai.validation.js";

import createController from "../../controllers/relational/shiftPegawai/create.controller.js";
import readController from "../../controllers/relational/shiftPegawai/read.controller.js";
import getByIdController from "../../controllers/relational/shiftPegawai/getById.controller.js";
import updateController from "../../controllers/relational/shiftPegawai/update.controller.js";
import deleteController from "../../controllers/relational/shiftPegawai/delete.controller.js";

// auto-resolve variants
import createAutoResolveController from "../../controllers/relational/shiftPegawai/createAutoResolve.controller.js";
import updateAutoResolveController from "../../controllers/relational/shiftPegawai/updateAutoResolve.controller.js";

const router = Router();

// standar CRUD
router.get("/", validate(readSchema, "query"), readController);
router.post("/", validate(createSchema), createController);
router.get("/:id", validate(paramsSchema, "params"), getByIdController);
router.put("/:id", validate(paramsSchema, "params"), validate(updateSchema), updateController);
router.delete("/:id", validate(paramsSchema, "params"), deleteController);

// optional: endpoint auto-resolve (transactional)
router.post("/auto", validate(createSchema), createAutoResolveController);
router.put("/auto/:id", validate(paramsSchema, "params"), validate(updateSchema), updateAutoResolveController);

export default router;
