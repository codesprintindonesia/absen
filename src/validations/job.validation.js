/**
 * Validation schemas untuk job management
 * File: src/validations/job.validation.js
 */

import Joi from "joi";

/**
 * Schema untuk start job dengan cron time
 */
export const startJobSchema = Joi.object({
  cronTime: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .default("02:00")
    .messages({
      "string.pattern.base": "cronTime must be in HH:MM format (00:00 - 23:59)",
    }),
});

/**
 * Schema untuk manual reconciliation
 */
export const manualReconciliationSchema = Joi.object({
  tanggal: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      "date.base": "tanggal must be a valid date",
      "date.format": "tanggal must be in YYYY-MM-DD format",
      "any.required": "tanggal is required",
    }),
});

/**
 * Schema untuk job name parameter
 */
export const jobNameSchema = Joi.object({
  jobName: Joi.string().required().messages({
    "any.required": "jobName is required",
  }),
});
