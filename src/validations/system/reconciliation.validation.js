// ================================================================
// 6. src/validations/system/reconciliation.validation.js
// Validation schema
// ================================================================

import Joi from 'joi';

const manualRunSchema = Joi.object({
  target_date: Joi.date().iso().optional()
});

export { manualRunSchema };