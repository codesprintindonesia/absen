// src/services/laporan/realisasiLembur/create.service.js

import createRepository from "../../../repositories/laporan/realisasiLembur/create.repository.js";
import { generateRealisasiLemburId } from "../../../utils/idGenerator.util.js";

/**
 * Create new realisasi lembur record
 * @param {Object} data - Realisasi lembur data
 * @param {string} data.id_pegawai - Employee ID
 * @param {Date} data.periode_bulan_lembur - Overtime period month
 * @param {number} data.total_jam_lembur_bulanan - Total monthly overtime hours
 * @param {number} [data.total_hari_terlambat] - Total late days
 * @param {number} [data.total_menit_keterlambatan] - Total late minutes
 * @param {number} [data.total_hari_tidak_hadir] - Total absent days
 * @param {number} [data.total_hari_kerja_efektif] - Total effective work days
 * @returns {Promise<Object>} Created realisasi lembur record
 */
const createService = async (data) => {
  // Generate ID otomatis dengan format LBR-{id_pegawai}-{YYYYMM}
  const periodeBulan = new Date(data.periode_bulan_lembur).toISOString().substring(0, 7); // YYYY-MM
  const generatedId = generateRealisasiLemburId(data.id_pegawai, periodeBulan);

  const realisasiLemburData = {
    ...data,
    id: generatedId, // Auto-generated ID
  };

  return await createRepository(realisasiLemburData);
};

export default createService;