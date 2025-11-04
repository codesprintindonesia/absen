import { Router } from 'express';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createSchema,
  readSchema,
  updateSchema,
  paramsSchema,
} from '../../validations/master/kebijakanAbsensi.validation.js';
import createController from '../../controllers/master/kebijakanAbsensi/create.controller.js';
import readController from '../../controllers/master/kebijakanAbsensi/read.controller.js';
import updateController from '../../controllers/master/kebijakanAbsensi/update.controller.js';
import deleteController from '../../controllers/master/kebijakanAbsensi/delete.controller.js';
import getByIdController from '../../controllers/master/kebijakanAbsensi/getById.controller.js';

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
