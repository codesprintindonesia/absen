// src/repositories/transactional/absensiHarian/rekonsiliasi.repository.js

import { AbsensiHarian } from '../../../models/transactional/absensiHarian.model.js';
import { ShiftHarianPegawai } from '../../../models/transactional/shiftHarianPegawai.model.js';
import { LogRawAbsensi } from '../../../models/transactional/logRawAbsensi.model.js';
import { KebijakanAbsensi } from '../../../models/master/kebijakanAbsensi.model.js';
import { ShiftKerja } from '../../../models/master/shiftKerja.model.js';
import { LokasiKerja } from '../../../models/master/lokasiKerja.model.js';
import { LokasiKerjaPegawai } from '../../../models/relational/lokasiKerjaPegawai.model.js';
import { ProsesHarian } from '../../../models/system/prosesHarian.model.js';
import { Op, QueryTypes } from 'sequelize';
import { getSequelize } from '../../../libraries/databaseInstance.library.js';

const sequelize = await getSequelize();

/**
 * Ambil jadwal shift harian pegawai untuk tanggal tertentu
 * Menggunakan Sequelize Model dengan include (100% Model-based)
 * 
 * @param {string} tanggal - Tanggal dalam format YYYY-MM-DD
 * @param {Object} options - Sequelize options (termasuk transaction)
 * @returns {Array} Array of shift harian dengan detail shift dan lokasi
 */
export const getShiftHarianByDate = async (tanggal, options = {}) => {
  const shiftHarian = await ShiftHarianPegawai.findAll({
    where: { tanggal_kerja: tanggal },
    include: [
      {
        model: ShiftKerja,
        as: 'shiftKerja',
        required: true,
        attributes: [
          'id',
          'nama',
          'jam_masuk',
          'jam_pulang',
          'durasi_istirahat',
          'toleransi_keterlambatan'
        ]
      },
      {
        model: LokasiKerja,
        as: 'lokasiKerja',
        required: false,
        attributes: [
          'id',
          'nama',
          'kode_referensi'
        ]
      }
    ],
    order: [['id_pegawai', 'ASC']],
    ...options
  });

  // Transform ke format yang dibutuhkan service
  return shiftHarian.map(sh => {
    const json = sh.toJSON();
    return {
      id: json.id,
      id_pegawai: json.id_pegawai,
      tanggal_kerja: json.tanggal_kerja,
      id_shift_kerja: json.id_shift_kerja_aktual,
      id_lokasi_kerja: json.id_lokasi_kerja_aktual,
      nama_pegawai: json.nama_pegawai,
      id_personal: json.id_personal,
      nama_shift: json.shiftKerja?.nama,
      jam_masuk: json.shiftKerja?.jam_masuk,
      jam_pulang: json.shiftKerja?.jam_pulang,
      durasi_istirahat: json.shiftKerja?.durasi_istirahat,
      toleransi_keterlambatan: json.shiftKerja?.toleransi_keterlambatan,
      nama_lokasi: json.lokasiKerja?.nama,
      kode_lokasi: json.lokasiKerja?.kode_referensi
    };
  });
};

/**
 * Ambil raw log absensi untuk tanggal tertentu
 * Menggunakan Sequelize Model dengan date filtering
 * 
 * @param {string} tanggal - Tanggal dalam format YYYY-MM-DD
 * @param {Object} options - Sequelize options (termasuk transaction)
 * @returns {Array} Array of raw log absensi
 */
export const getRawAbsensiByDate = async (tanggal, options = {}) => { 
  
  const logs = await LogRawAbsensi.findAll({
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.fn('DATE', sequelize.col('waktu_log')),
          tanggal
        ),
        { status_validasi: 'VALID' }
      ]
    },
    attributes: [
      'id',
      'id_pegawai',
      'waktu_log',
      'id_lokasi_kerja',
      'koordinat_gps',
      'source_absensi',
      'keterangan_log'
    ],
    order: [
      ['id_pegawai', 'ASC'],
      ['waktu_log', 'ASC']
    ],
    ...options
  });

  return logs.map(log => log.toJSON());
};

/**
 * Ambil kebijakan absensi yang aktif dan default
 * Menggunakan Sequelize Model
 * 
 * @param {Object} options - Sequelize options (termasuk transaction)
 * @returns {Object|null} Kebijakan absensi atau null jika tidak ditemukan
 */
export const getKebijakanAbsensiAktif = async (options = {}) => {
  const kebijakan = await KebijakanAbsensi.findOne({
    where: {
      is_default: true,
      is_active: true
    },
    attributes: [
      'id',
      'nama',
      'toleransi_keterlambatan',
      'min_jam_kerja_full_day',
      'jam_cut_off_hari'
    ],
    order: [['created_at', 'DESC']],
    ...options
  });

  return kebijakan ? kebijakan.toJSON() : null;
};

/**
 * Ambil lokasi kerja pegawai yang aktif untuk tanggal tertentu
 * Menggunakan Sequelize Model dengan include
 * 
 * @param {string} idPegawai - ID Pegawai
 * @param {string} tanggal - Tanggal dalam format YYYY-MM-DD
 * @param {Object} options - Sequelize options (termasuk transaction)
 * @returns {Array} Array of lokasi kerja pegawai
 */
export const getLokasiKerjaPegawai = async (idPegawai, tanggal, options = {}) => {
  const lokasi = await LokasiKerjaPegawai.findAll({
    where: {
      id_pegawai: idPegawai,
      is_active: true,
      tanggal_mulai_berlaku: { [Op.lte]: tanggal },
      [Op.or]: [
        { tanggal_akhir_berlaku: null },
        { tanggal_akhir_berlaku: { [Op.gte]: tanggal } }
      ]
    },
    include: [
      {
        model: LokasiKerja,
        as: 'lokasiKerja',
        required: true,
        attributes: ['id', 'nama', 'kode_referensi']
      }
    ],
    order: [['prioritas_lokasi', 'ASC']],
    ...options
  });

  return lokasi.map(lok => {
    const json = lok.toJSON();
    return {
      id_lokasi_kerja: json.id_lokasi_kerja,
      nama_lokasi: json.lokasiKerja?.nama,
      kode_lokasi: json.lokasiKerja?.kode_referensi,
      prioritas_lokasi: json.prioritas_lokasi
    };
  });
};

/**
 * Cek apakah data absensi sudah ada untuk pegawai di tanggal tertentu
 * Menggunakan Sequelize Model count
 * 
 * @param {string} idPegawai - ID Pegawai
 * @param {string} tanggal - Tanggal dalam format YYYY-MM-DD
 * @param {Object} options - Sequelize options (termasuk transaction)
 * @returns {boolean} True jika sudah ada
 */
export const checkAbsensiExists = async (idPegawai, tanggal, options = {}) => {
  const count = await AbsensiHarian.count({
    where: {
      id_pegawai: idPegawai,
      tanggal_absensi: tanggal
    },
    ...options
  });

  return count > 0;
};

/**
 * Insert data absensi harian baru
 * Menggunakan Sequelize Model create
 * 
 * @param {Object} absensiData - Data absensi harian
 * @param {Object} options - Sequelize options (termasuk transaction)
 * @returns {Object} Data absensi yang baru dibuat
 */
export const insertAbsensiHarian = async (absensiData, options = {}) => {
  const result = await AbsensiHarian.create(absensiData, options);
  return result.toJSON();
};

/**
 * Insert log proses harian
 * Menggunakan Sequelize Model create
 * 
 * @param {Object} logData - Data log proses harian
 * @param {Object} options - Sequelize options (termasuk transaction)
 * @returns {Object} Data log yang baru dibuat
 */
export const insertLogProsesHarian = async (logData, options = {}) => {
  const result = await ProsesHarian.create(logData, options);
  return result.toJSON();
};

// ... existing functions ...

/**
 * Cek apakah tanggal tertentu sudah memiliki data absensi
 * Menggunakan EXISTS untuk performance optimal
 * 
 * @param {string} tanggal - Tanggal dalam format YYYY-MM-DD
 * @param {Object} options - Sequelize transaction options
 * @returns {Promise<boolean>} True jika sudah ada data, false jika belum
 */
export const checkAbsensiExistsByDate = async (tanggal, options = {}) => {
  const query = `
    SELECT EXISTS (
      SELECT 1 
      FROM absensi.t_absensi_harian 
      WHERE tanggal_absensi = :tanggal
    ) as has_data
  `;
  
  const [result] = await sequelize.query(query, {
    replacements: { tanggal },
    type: QueryTypes.SELECT,
    ...options
  });
  
  return result.has_data;
};

// ... existing exports ...