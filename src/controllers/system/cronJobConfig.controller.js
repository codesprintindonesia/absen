// ================================================================
// src/controllers/system/cronJobConfig.controller.js
// Controller untuk manage cron jobs
// ================================================================

import {
  getAllCronJobsService,
  getCronJobByIdService,
  createCronJobService,
  updateCronJobService,
  deleteCronJobService,
  enableCronJobService,
  disableCronJobService,
  pauseCronJobService,
  resumeCronJobService,
} from "../../services/system/cronJobConfig/manageCronJob.service.js";
import {
  reloadAllCronJobs,
  enableCronJob as schedulerEnableCronJob,
  disableCronJob as schedulerDisableCronJob,
  getSchedulerStatus,
} from "../../schedulers/centralizedCron.scheduler.js";
import HTTP_STATUS from "../../constants/httpStatus.constant.js";

/**
 * Get all cron jobs
 * GET /api/cron-jobs
 * Query params:
 *   - enabledOnly: boolean (default: false)
 */
export const getAllCronJobs = async (req, res, next) => {
  try {
    const enabledOnly = req.query.enabledOnly === "true";

    const cronJobs = await getAllCronJobsService({ enabledOnly });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Cron jobs retrieved successfully",
      data: cronJobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get cron job by ID
 * GET /api/cron-jobs/:id
 */
export const getCronJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cronJob = await getCronJobByIdService(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Cron job retrieved successfully",
      data: cronJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new cron job
 * POST /api/cron-jobs
 * Body: { id, job_name, job_type, cron_expression, is_enabled, config_params, description, timezone }
 */
export const createCronJob = async (req, res, next) => {
  try {
    const createdBy = req.user?.id || req.user?.username || "SYSTEM";

    const cronJob = await createCronJobService(req.body, {
      req,
      createdBy,
    });

    // Reload scheduler if job is enabled
    if (cronJob.is_enabled) {
      await reloadAllCronJobs();
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Cron job created successfully",
      data: cronJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update cron job
 * PUT /api/cron-jobs/:id
 * Body: { job_name, cron_expression, is_enabled, config_params, description, timezone }
 */
export const updateCronJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user?.id || req.user?.username || "SYSTEM";

    const cronJob = await updateCronJobService(id, req.body, {
      req,
      updatedBy,
    });

    // Reload scheduler to apply changes
    await reloadAllCronJobs();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Cron job updated successfully",
      data: cronJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete cron job
 * DELETE /api/cron-jobs/:id
 */
export const deleteCronJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedBy = req.user?.id || req.user?.username || "SYSTEM";

    const result = await deleteCronJobService(id, {
      req,
      deletedBy,
    });

    // Reload scheduler to remove job
    await reloadAllCronJobs();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Cron job deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enable cron job
 * POST /api/cron-jobs/:id/enable
 */
export const enableCronJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user?.id || req.user?.username || "SYSTEM";

    const cronJob = await enableCronJobService(id, {
      req,
      updatedBy,
    });

    // Enable in scheduler
    const enabled = await schedulerEnableCronJob(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Cron job enabled successfully",
      data: {
        config: cronJob,
        scheduler_started: enabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable cron job
 * POST /api/cron-jobs/:id/disable
 */
export const disableCronJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user?.id || req.user?.username || "SYSTEM";

    const cronJob = await disableCronJobService(id, {
      req,
      updatedBy,
    });

    // Disable in scheduler
    const disabled = schedulerDisableCronJob(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Cron job disabled successfully",
      data: {
        config: cronJob,
        scheduler_stopped: disabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pause cron job
 * POST /api/cron-jobs/:id/pause
 */
export const pauseCronJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user?.id || req.user?.username || "SYSTEM";

    const cronJob = await pauseCronJobService(id, {
      req,
      updatedBy,
    });

    // Stop in scheduler
    const stopped = schedulerDisableCronJob(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Cron job paused successfully",
      data: {
        config: cronJob,
        scheduler_stopped: stopped,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resume paused cron job
 * POST /api/cron-jobs/:id/resume
 */
export const resumeCronJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user?.id || req.user?.username || "SYSTEM";

    const cronJob = await resumeCronJobService(id, {
      req,
      updatedBy,
    });

    // Start in scheduler
    const started = await schedulerEnableCronJob(id);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Cron job resumed successfully",
      data: {
        config: cronJob,
        scheduler_started: started,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reload all cron jobs from database
 * POST /api/cron-jobs/reload
 */
export const reloadCronJobs = async (req, res, next) => {
  try {
    const result = await reloadAllCronJobs();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Cron jobs reloaded successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get scheduler status
 * GET /api/cron-jobs/scheduler/status
 */
export const getSchedulerStatusController = async (req, res, next) => {
  try {
    const status = getSchedulerStatus();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Scheduler status retrieved successfully",
      data: status,
    });
  } catch (error) {
    next(error);
  }
};
