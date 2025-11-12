// src/services/laporan/realisasiLembur/update.service.js

import updateRepository from "../../../repositories/laporan/realisasiLembur/update.repository.js";
import getByIdRepository from "../../../repositories/laporan/realisasiLembur/getById.repository.js";

/**
 * Update realisasi lembur by ID
 * @param {string} id - Realisasi lembur ID
 * @param {Object} data - Data to update
 * @param {number} [data.total_jam_lembur_bulanan] - Total monthly overtime hours
 * @param {number} [data.total_hari_terlambat] - Total late days
 * @param {number} [data.total_menit_keterlambatan] - Total late minutes
 * @param {number} [data.total_hari_tidak_hadir] - Total absent days
 * @param {number} [data.total_hari_kerja_efektif] - Total effective work days
 * @param {boolean} [data.is_data_final] - Is data final
 * @returns {Promise<Object>} Updated realisasi lembur record
 * @throws {Error} If record not found (404)
 */
const updateService = async (id, data) => {
  const existing = await getByIdRepository(id);
  
  if (!existing) {
    const error = new Error("Data realisasi lembur tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  const updated = await updateRepository(id, data);
  
  return updated;
};

export default updateService;