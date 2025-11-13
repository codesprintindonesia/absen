// ================================================================
// src/repositories/transactional/absensiHarian/delete.repository.js
// Repository untuk delete absensi harian
// ================================================================

import { AbsensiHarian } from "../../../models/transactional/absensiHarian.model.js";

/**
 * Delete absensi harian by ID (hard delete)
 * @param {string} id - Absensi harian ID
 * @param {Object} [options] - Options object
 * @param {Object} [options.transaction] - Sequelize transaction
 * @returns {Promise<number>} Number of deleted rows
 */
const deleteRepository = async (id, options = {}) => {
  const deletedCount = await AbsensiHarian.destroy({
    where: { id },
    transaction: options.transaction,
  });

  return deletedCount;
};

export default deleteRepository;
