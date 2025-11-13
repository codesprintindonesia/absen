// ================================================================
// src/repositories/transactional/absensiHarian/update.repository.js
// Repository untuk update absensi harian
// ================================================================

import { AbsensiHarian } from "../../../models/transactional/absensiHarian.model.js";

/**
 * Update absensi harian by ID
 * @param {string} id - Absensi harian ID
 * @param {Object} data - Data to update
 * @param {Object} [options] - Options object
 * @param {Object} [options.transaction] - Sequelize transaction
 * @returns {Promise<Object>} Updated absensi harian data
 */
const updateRepository = async (id, data, options = {}) => {
  // Update record
  await AbsensiHarian.update(data, {
    where: { id },
    transaction: options.transaction,
  });

  // Fetch updated record
  const updated = await AbsensiHarian.findByPk(id, {
    transaction: options.transaction,
    raw: true,
  });

  return updated;
};

export default updateRepository;
