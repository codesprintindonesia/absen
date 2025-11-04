// src/repositories/laporan/realisasiLembur/updateRealisasiLembur.repository.js

import { RealisasiLembur } from "../../../models/laporan/realisasiLembur.model.js";

/**
 * Update realisasi lembur yang sudah ada
 * 
 * @param {string} id - ID realisasi lembur
 * @param {Object} data - Data yang akan diupdate
 * @param {Object} options - Sequelize options (termasuk transaction)
 * @returns {Promise<RealisasiLembur>} RealisasiLembur record yang sudah diupdate
 */
export const updateRealisasiLembur = async (id, data, options = {}) => {
  const [affectedRows, [updatedRecord]] = await RealisasiLembur.update(data, {
    where: { id },
    returning: true,
    ...options,
  });

  return updatedRecord;
};