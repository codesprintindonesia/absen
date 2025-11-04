// src/repositories/laporan/realisasiLembur/findRealisasiLembur.repository.js

import { RealisasiLembur } from "../../../models/laporan/realisasiLembur.model.js";

/**
 * Cari realisasi lembur berdasarkan pegawai dan periode
 * 
 * @param {string} idPegawai - ID pegawai
 * @param {Date} periodeBulan - Periode bulan (normalized ke tanggal 1)
 * @param {Object} options - Sequelize options (termasuk transaction)
 * @returns {Promise<RealisasiLembur|null>} RealisasiLembur record atau null
 */
export const findRealisasiLembur = async (idPegawai, periodeBulan, options = {}) => {
  const result = await RealisasiLembur.findOne({
    where: {
      id_pegawai: idPegawai,
      periode_bulan_lembur: periodeBulan,
    },
    ...options,
  });

  return result;
};