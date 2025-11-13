// ================================================================
// src/routes/system/cronJobConfig.route.js
// Routes untuk cron job management
// ================================================================

import { Router } from "express";
import {
  getAllCronJobs,
  getCronJobById,
  createCronJob,
  updateCronJob,
  deleteCronJob,
  enableCronJob,
  disableCronJob,
  pauseCronJob,
  resumeCronJob,
  reloadCronJobs,
  getSchedulerStatusController,
} from "../../controllers/system/cronJobConfig.controller.js";

const router = Router();

// ================================================================
// SCHEDULER STATUS & CONTROL
// ================================================================

/**
 * GET /api/cron-jobs/scheduler/status
 * Get current scheduler status
 */
router.get("/scheduler/status", getSchedulerStatusController);

/**
 * POST /api/cron-jobs/reload
 * Reload all cron jobs from database
 */
router.post("/reload", reloadCronJobs);

// ================================================================
// CRON JOB CRUD
// ================================================================

/**
 * GET /api/cron-jobs
 * Get all cron jobs
 * Query params: enabledOnly (boolean)
 */
router.get("/", getAllCronJobs);

/**
 * GET /api/cron-jobs/:id
 * Get cron job by ID
 */
router.get("/:id", getCronJobById);

/**
 * POST /api/cron-jobs
 * Create new cron job
 * Body: { id, job_name, job_type, cron_expression, is_enabled, config_params, description, timezone }
 */
router.post("/", createCronJob);

/**
 * PUT /api/cron-jobs/:id
 * Update cron job
 * Body: { job_name, cron_expression, is_enabled, config_params, description, timezone }
 */
router.put("/:id", updateCronJob);

/**
 * DELETE /api/cron-jobs/:id
 * Delete cron job
 */
router.delete("/:id", deleteCronJob);

// ================================================================
// CRON JOB CONTROL
// ================================================================

/**
 * POST /api/cron-jobs/:id/enable
 * Enable cron job
 */
router.post("/:id/enable", enableCronJob);

/**
 * POST /api/cron-jobs/:id/disable
 * Disable cron job
 */
router.post("/:id/disable", disableCronJob);

/**
 * POST /api/cron-jobs/:id/pause
 * Pause cron job (temporary disable)
 */
router.post("/:id/pause", pauseCronJob);

/**
 * POST /api/cron-jobs/:id/resume
 * Resume paused cron job
 */
router.post("/:id/resume", resumeCronJob);

export default router;
