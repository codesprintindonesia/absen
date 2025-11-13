// ================================================================
// src/repositories/system/cronJobConfig/delete.repository.js
// Repository untuk delete cron job config
// ================================================================

import { CronJobConfig } from "../../../models/system/cronJobConfig.model.js";

/**
 * Delete cron job config by ID
 * @param {string} id - Cron job config ID
 * @param {Object} [options] - Options object
 * @param {Object} [options.transaction] - Sequelize transaction
 * @returns {Promise<number>} Number of deleted records
 */
const deleteCronJobConfigRepository = async (id, options = {}) => {
  const deletedCount = await CronJobConfig.destroy({
    where: { id },
    transaction: options.transaction,
  });

  return deletedCount;
};

export default deleteCronJobConfigRepository;
