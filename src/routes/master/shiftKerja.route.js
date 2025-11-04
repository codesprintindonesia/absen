// src/routes/master/shiftKerja.route.js
import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createSchema,
  updateSchema,
  readSchema,
  paramsSchema,
} from '../../validations/master/shiftKerja.validation.js';
import createController from '../../controllers/master/shiftKerja/create.controller.js';
import readController from '../../controllers/master/shiftKerja/read.controller.js';
import getByIdController from '../../controllers/master/shiftKerja/getById.controller.js';
import updateController from '../../controllers/master/shiftKerja/update.controller.js';
import deleteController from '../../controllers/master/shiftKerja/delete.controller.js';

const router = Router();

router.get('/', validate(readSchema, "query"), readController);
router.post('/', validate(createSchema), createController);
router.get('/:id', validate(paramsSchema, 'params'), getByIdController);
router.put('/:id',
  validate(paramsSchema, 'params'),
  validate(updateSchema),
  updateController
);
router.delete('/:id', validate(paramsSchema, 'params'), deleteController);

export default router;
