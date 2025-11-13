// ================================================================
// src/services/system/cronJobConfig/manageCronJob.service.js
// Service untuk manage cron jobs (enable/disable/status/trigger)
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import findAllCronJobConfigRepository from "../../../repositories/system/cronJobConfig/findAll.repository.js";
import findByIdCronJobConfigRepository from "../../../repositories/system/cronJobConfig/findById.repository.js";
import createCronJobConfigRepository from "../../../repositories/system/cronJobConfig/create.repository.js";
import updateCronJobConfigRepository from "../../../repositories/system/cronJobConfig/update.repository.js";
import deleteCronJobConfigRepository from "../../../repositories/system/cronJobConfig/delete.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Get all cron job configs
 * @param {Object} [options] - Options object
 * @param {boolean} [options.enabledOnly=false] - Only return enabled jobs
 * @returns {Promise<Array>} Array of cron job configs
 */
export const getAllCronJobsService = async ({ enabledOnly = false } = {}) => {
  const where = enabledOnly ? { is_enabled: true } : {};
  const configs = await findAllCronJobConfigRepository({ where });
  return configs;
};

/**
 * Get cron job config by ID
 * @param {string} id - Cron job config ID
 * @returns {Promise<Object>} Cron job config
 * @throws {Error} If config not found
 */
export const getCronJobByIdService = async (id) => {
  const config = await findByIdCronJobConfigRepository(id);

  if (!config) {
    const error = new Error(`Cron job config dengan ID ${id} tidak ditemukan`);
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  return config;
};

/**
 * Create new cron job config
 * @param {Object} data - Cron job config data
 * @param {string} data.id - Unique ID
 * @param {string} data.job_name - Job name
 * @param {string} data.job_type - Job type
 * @param {string} data.cron_expression - Cron expression
 * @param {boolean} [data.is_enabled=false] - Enable flag
 * @param {Object} [data.config_params] - Config parameters
 * @param {string} [data.description] - Description
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.createdBy='SYSTEM'] - User creating the config
 * @returns {Promise<Object>} Created cron job config
 */
export const createCronJobService = async (data, { req, createdBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const configData = {
      ...data,
      status: data.is_enabled ? "ENABLED" : "DISABLED",
      created_by: createdBy,
      updated_by: createdBy,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await createCronJobConfigRepository(configData, { transaction });

    // Log audit CREATE
    await auditLog({
      action: AUDIT_ACTION.CREATE,
      tableName: "system.s_cron_job_config",
      refId: result.id,
      beforeData: null,
      afterData: result,
      req,
      transaction,
    });

    await transaction.commit();
    return result;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

/**
 * Update cron job config
 * @param {string} id - Cron job config ID
 * @param {Object} updateData - Data to update
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.updatedBy='SYSTEM'] - User updating the config
 * @returns {Promise<Object>} Updated cron job config
 * @throws {Error} If config not found
 */
export const updateCronJobService = async (id, updateData, { req, updatedBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Check if exists
    const existing = await findByIdCronJobConfigRepository(id, { transaction });

    if (!existing) {
      const error = new Error(`Cron job config dengan ID ${id} tidak ditemukan`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    const beforeData = existing;

    const dataToUpdate = {
      ...updateData,
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    // Update status berdasarkan is_enabled jika diubah
    if (typeof updateData.is_enabled === 'boolean') {
      dataToUpdate.status = updateData.is_enabled ? "ENABLED" : "DISABLED";
    }

    const updated = await updateCronJobConfigRepository(id, dataToUpdate, { transaction });

    // Log audit UPDATE
    await auditLog({
      action: AUDIT_ACTION.UPDATE,
      tableName: "system.s_cron_job_config",
      refId: id,
      beforeData: beforeData,
      afterData: updated,
      req,
      transaction,
    });

    await transaction.commit();
    return updated;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

/**
 * Delete cron job config
 * @param {string} id - Cron job config ID
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.deletedBy='SYSTEM'] - User deleting the config
 * @returns {Promise<Object>} Deleted config details
 * @throws {Error} If config not found
 */
export const deleteCronJobService = async (id, { req, deletedBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Check if exists
    const existing = await findByIdCronJobConfigRepository(id, { transaction });

    if (!existing) {
      const error = new Error(`Cron job config dengan ID ${id} tidak ditemukan`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    const beforeData = existing;

    const deletedCount = await deleteCronJobConfigRepository(id, { transaction });

    if (deletedCount === 0) {
      throw new Error("DELETE_FAILED");
    }

    // Log audit DELETE
    await auditLog({
      action: AUDIT_ACTION.DELETE,
      tableName: "system.s_cron_job_config",
      refId: id,
      beforeData: beforeData,
      afterData: null,
      req,
      transaction,
    });

    await transaction.commit();

    return {
      deleted_detail: existing,
      deleted_by: deletedBy,
      deleted_at: new Date().toISOString(),
    };
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

/**
 * Enable cron job
 * @param {string} id - Cron job config ID
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.updatedBy='SYSTEM'] - User enabling the job
 * @returns {Promise<Object>} Updated config
 */
export const enableCronJobService = async (id, { req, updatedBy = 'SYSTEM' } = {}) => {
  return await updateCronJobService(
    id,
    { is_enabled: true, status: "ENABLED" },
    { req, updatedBy }
  );
};

/**
 * Disable cron job
 * @param {string} id - Cron job config ID
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.updatedBy='SYSTEM'] - User disabling the job
 * @returns {Promise<Object>} Updated config
 */
export const disableCronJobService = async (id, { req, updatedBy = 'SYSTEM' } = {}) => {
  return await updateCronJobService(
    id,
    { is_enabled: false, status: "DISABLED" },
    { req, updatedBy }
  );
};

/**
 * Pause cron job (temporarily disable)
 * @param {string} id - Cron job config ID
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.updatedBy='SYSTEM'] - User pausing the job
 * @returns {Promise<Object>} Updated config
 */
export const pauseCronJobService = async (id, { req, updatedBy = 'SYSTEM' } = {}) => {
  return await updateCronJobService(
    id,
    { is_enabled: false, status: "PAUSED" },
    { req, updatedBy }
  );
};

/**
 * Resume paused cron job
 * @param {string} id - Cron job config ID
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.updatedBy='SYSTEM'] - User resuming the job
 * @returns {Promise<Object>} Updated config
 */
export const resumeCronJobService = async (id, { req, updatedBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const existing = await findByIdCronJobConfigRepository(id, { transaction });

    if (!existing) {
      const error = new Error(`Cron job config dengan ID ${id} tidak ditemukan`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Only resume if currently paused
    if (existing.status !== "PAUSED") {
      const error = new Error(`Cron job hanya bisa di-resume jika status PAUSED. Status saat ini: ${existing.status}`);
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }

    await transaction.rollback();

    return await updateCronJobService(
      id,
      { is_enabled: true, status: "ENABLED" },
      { req, updatedBy }
    );
  } catch (error) {
    if (transaction && !transaction.finished) await transaction.rollback();
    throw error;
  }
};

/**
 * Update last run info for cron job
 * INTERNAL USE ONLY - Called by scheduler after job execution
 * @param {string} id - Cron job config ID
 * @param {Object} runInfo - Run information
 * @param {string} runInfo.status - Run status (SUCCESS/FAILED/PARTIAL)
 * @param {string} [runInfo.error] - Error message if failed
 * @param {Date} [runInfo.nextRun] - Next scheduled run time
 * @returns {Promise<Object>} Updated config
 */
export const updateLastRunService = async (id, runInfo) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const updateData = {
      last_run: new Date(),
      last_status: runInfo.status,
      last_error: runInfo.error || null,
      next_run: runInfo.nextRun || null,
      updated_at: new Date(),
    };

    const updated = await updateCronJobConfigRepository(id, updateData, { transaction });

    await transaction.commit();
    return updated;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};
