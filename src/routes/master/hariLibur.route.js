// src/routes/master/hariLibur.route.js
import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createSchema,
  updateSchema,
  readSchema,
  paramsSchema,
} from '../../validations/master/hariLibur.validation.js';
import createController from '../../controllers/master/hariLibur/create.controller.js';
import readController from '../../controllers/master/hariLibur/read.controller.js';
import getByIdController from '../../controllers/master/hariLibur/getById.controller.js';
import updateController from '../../controllers/master/hariLibur/update.controller.js';
import deleteController from '../../controllers/master/hariLibur/delete.controller.js';

const router = Router();

router.get('/', validate(readSchema, "query"), readController);
router.post('/', validate(createSchema), createController);
router.get('/:tanggal', validate(paramsSchema, 'params'), getByIdController);
router.put('/:tanggal',
  validate(paramsSchema, 'params'),
  validate(updateSchema),
  updateController
);
router.delete('/:tanggal', validate(paramsSchema, 'params'), deleteController);

export default router;