// src/repositories/laporan/realisasiLembur/getPegawaiListByPeriode.repository.js

import { AbsensiHarian } from "../../../models/transactional/absensiHarian.model.js";
import { Op } from "sequelize";

/**
 * Ambil daftar pegawai unik yang memiliki data absensi dalam periode
 * 
 * @param {Date} tanggalAwal - Tanggal awal periode
 * @param {Date} tanggalAkhir - Tanggal akhir periode
 * @param {Sequelize} sequelize - Sequelize instance
 * @param {Object} options - Sequelize options (termasuk transaction)
 * @returns {Promise<Array>} Array of objects with id_pegawai
 */
export const getPegawaiListByPeriode = async (
  tanggalAwal,
  tanggalAkhir,
  sequelize,
  options = {}
) => {
  const result = await AbsensiHarian.findAll({
    attributes: [
      [sequelize.fn("DISTINCT", sequelize.col("id_pegawai")), "id_pegawai"],
    ],
    where: {
      tanggal_absensi: {
        [Op.between]: [tanggalAwal, tanggalAkhir],
      },
    },
    raw: true,
    ...options,
  });

  return result;
};