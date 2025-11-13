// ================================================================
// src/repositories/transactional/absensiHarian/findById.repository.js
// Repository untuk find absensi harian by ID
// ================================================================

import { AbsensiHarian } from "../../../models/transactional/absensiHarian.model.js";

/**
 * Find absensi harian by ID
 * @param {string} id - Absensi harian ID
 * @param {Object} [options] - Options object
 * @param {Object} [options.transaction] - Sequelize transaction
 * @returns {Promise<Object|null>} Absensi harian data or null if not found
 */
const findByIdRepository = async (id, options = {}) => {
  const absensi = await AbsensiHarian.findByPk(id, {
    transaction: options.transaction,
    raw: true,
  });

  return absensi;
};

export default findByIdRepository;
