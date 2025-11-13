// ================================================================
// src/repositories/system/cronJobConfig/create.repository.js
// Repository untuk create cron job config
// ================================================================

import { CronJobConfig } from "../../../models/system/cronJobConfig.model.js";

/**
 * Create new cron job config
 * @param {Object} data - Cron job config data
 * @param {Object} [options] - Options object
 * @param {Object} [options.transaction] - Sequelize transaction
 * @returns {Promise<Object>} Created cron job config
 */
const createCronJobConfigRepository = async (data, options = {}) => {
  const config = await CronJobConfig.create(data, {
    transaction: options.transaction,
  });

  return config.toJSON();
};

export default createCronJobConfigRepository;
