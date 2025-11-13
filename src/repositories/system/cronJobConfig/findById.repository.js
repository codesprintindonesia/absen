// ================================================================
// src/repositories/system/cronJobConfig/findById.repository.js
// Repository untuk find cron job config by ID
// ================================================================

import { CronJobConfig } from "../../../models/system/cronJobConfig.model.js";

/**
 * Find cron job config by ID
 * @param {string} id - Cron job config ID
 * @param {Object} [options] - Options object
 * @param {Object} [options.transaction] - Sequelize transaction
 * @returns {Promise<Object|null>} Cron job config or null if not found
 */
const findByIdCronJobConfigRepository = async (id, options = {}) => {
  const config = await CronJobConfig.findByPk(id, {
    transaction: options.transaction,
    raw: true,
  });

  return config;
};

export default findByIdCronJobConfigRepository;
