import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createSchema,
  readSchema,
  updateSchema,
  paramsSchema,
} from '../../validations/master/shiftGroup.validation.js';
import createController from '../../controllers/master/shiftGroup/create.controller.js';
import readController from '../../controllers/master/shiftGroup/read.controller.js';
import updateController from '../../controllers/master/shiftGroup/update.controller.js';
import deleteController from '../../controllers/master/shiftGroup/delete.controller.js';
import getByIdController from '../../controllers/master/shiftGroup/getById.controller.js';

const router = Router();

router.get('/', validate(readSchema, "query"), readController);
router.post('/', validate(createSchema), createController);
router.get('/:id', validate(paramsSchema, 'params'), getByIdController);
router.put('/:id',
  validate(paramsSchema, 'params'),
  validate(updateSchema),  // pastikan minimal satu field dikirim:contentReference[oaicite:3]{index=3}
  updateController
);
router.delete('/:id', validate(paramsSchema, 'params'), deleteController);

export default router;
