// src/repositories/laporan/realisasiLembur/getAbsensiHarianByPegawaiAndPeriode.repository.js

import { AbsensiHarian } from "../../../models/transactional/absensiHarian.model.js";
import { Op } from "sequelize";

/**
 * Ambil semua data absensi harian untuk pegawai dalam periode bulan tertentu
 * 
 * @param {string} idPegawai - ID pegawai
 * @param {Date} tanggalAwal - Tanggal awal periode
 * @param {Date} tanggalAkhir - Tanggal akhir periode
 * @param {Object} options - Sequelize options (termasuk transaction)
 * @returns {Promise<Array>} Array of AbsensiHarian records
 */
export const getAbsensiHarianByPegawaiAndPeriode = async (
  idPegawai,
  tanggalAwal,
  tanggalAkhir,
  options = {}
) => {
  const result = await AbsensiHarian.findAll({
    where: {
      id_pegawai: idPegawai,
      tanggal_absensi: {
        [Op.between]: [tanggalAwal, tanggalAkhir],
      },
    },
    order: [["tanggal_absensi", "ASC"]],
    ...options,
  });

  return result;
};