// ================================================================
// src/repositories/system/cronJobConfig/findAll.repository.js
// Repository untuk get all cron job configs
// ================================================================

import { CronJobConfig } from "../../../models/system/cronJobConfig.model.js";

/**
 * Find all cron job configs dengan optional filtering
 * @param {Object} [options] - Options object
 * @param {Object} [options.where] - Where conditions
 * @param {Object} [options.transaction] - Sequelize transaction
 * @returns {Promise<Array>} Array of cron job configs
 */
const findAllCronJobConfigRepository = async (options = {}) => {
  const configs = await CronJobConfig.findAll({
    where: options.where || {},
    order: [["job_type", "ASC"]],
    transaction: options.transaction,
    raw: true,
  });

  return configs;
};

export default findAllCronJobConfigRepository;
