// ================================================================
// src/repositories/system/cronJobConfig/update.repository.js
// Repository untuk update cron job config
// ================================================================

import { CronJobConfig } from "../../../models/system/cronJobConfig.model.js";

/**
 * Update cron job config by ID
 * @param {string} id - Cron job config ID
 * @param {Object} data - Data to update
 * @param {Object} [options] - Options object
 * @param {Object} [options.transaction] - Sequelize transaction
 * @returns {Promise<Object>} Updated cron job config
 */
const updateCronJobConfigRepository = async (id, data, options = {}) => {
  await CronJobConfig.update(data, {
    where: { id },
    transaction: options.transaction,
  });

  const updated = await CronJobConfig.findByPk(id, {
    transaction: options.transaction,
    raw: true,
  });

  return updated;
};

export default updateCronJobConfigRepository;
