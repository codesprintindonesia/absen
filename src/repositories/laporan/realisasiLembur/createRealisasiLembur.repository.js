// src/repositories/laporan/realisasiLembur/createRealisasiLembur.repository.js

import { RealisasiLembur } from "../../../models/laporan/realisasiLembur.model.js";

/**
 * Insert realisasi lembur baru
 * 
 * @param {Object} data - Data realisasi lembur
 * @param {Object} options - Sequelize options (termasuk transaction)
 * @returns {Promise<RealisasiLembur>} RealisasiLembur record yang baru dibuat
 */
export const createRealisasiLembur = async (data, options = {}) => {
  const result = await RealisasiLembur.create(data, options);
  
  return result;
};