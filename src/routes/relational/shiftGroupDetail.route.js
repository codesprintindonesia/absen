import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createSchema,
  updateSchema,
  readSchema,
  paramsSchema,
} from "../../validations/relational/shiftGroupDetail.validation.js";
import createController from "../../controllers/relational/shiftGroupDetail/create.controller.js";
import readController from "../../controllers/relational/shiftGroupDetail/read.controller.js";
import getByIdController from "../../controllers/relational/shiftGroupDetail/getById.controller.js";
import updateController from "../../controllers/relational/shiftGroupDetail/update.controller.js";
import deleteController from "../../controllers/relational/shiftGroupDetail/delete.controller.js";

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
