// services/hariLibur.services.js
// Service layer untuk business logic m_hari_libur

import * as hariLiburRepository from '../repositories/hariLibur.repositories.js';
import { Op } from 'sequelize';

/**
 * Mendapatkan semua hari libur dengan filter dan pagination
 * @param {Object} queryParams - Query parameters dari request
 * @returns {Promise<Object>} - Result dengan data dan metadata
 */
export const getAllHariLibur = async (queryParams) => {
  const {
    page = 1,
    limit = 10, 
    tahun,
    bulan,
    start_date,
    end_date,
    search,
    sort_by = 'tanggal',
    sort_order = 'ASC',
  } = queryParams;

  const offset = (page - 1) * limit;
  const where = {}; 

  // Filter berdasarkan tahun
  if (tahun) {
    where.tanggal = {
      [Op.between]: [`${tahun}-01-01`, `${tahun}-12-31`],
    };
  }

  // Filter berdasarkan bulan (harus ada tahun)
  if (bulan && tahun) {
    const startDate = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
    const endDate = new Date(tahun, bulan, 0);
    const lastDay = String(endDate.getDate()).padStart(2, '0');
    where.tanggal = {
      [Op.between]: [startDate, `${tahun}-${String(bulan).padStart(2, '0')}-${lastDay}`],
    };
  }

  // Filter berdasarkan range tanggal
  if (start_date && end_date) {
    where.tanggal = {
      [Op.between]: [start_date, end_date],
    };
  }

  // Search berdasarkan nama libur atau keterangan
  if (search) {
    where[Op.or] = [
      { nama: { [Op.iLike]: `%${search}%` } },
      { keterangan: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const options = {
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [[sort_by, sort_order.toUpperCase()]],
  };

  const result = await hariLiburRepository.findAllHariLibur(options);

  return {
    holidays: result.rows,
    metadata: {
      total: result.count,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(result.count / limit),
    },
  };
};

/**
 * Mendapatkan hari libur berdasarkan tanggal
 * @param {string} tanggal - Tanggal dalam format YYYY-MM-DD
 * @returns {Promise<Object|null>} - Data hari libur atau null
 */
export const getHariLiburByTanggal = async (tanggal) => {
  const result = await hariLiburRepository.findHariLiburByTanggal(tanggal);
  return result;
};

/**
 * Membuat hari libur baru
 * @param {Object} data - Data hari libur
 * @returns {Promise<Object>} - Data hari libur yang dibuat
 */
export const createHariLibur = async (data) => {
  // Validasi tanggal tidak boleh duplikat
  const existing = await hariLiburRepository.findHariLiburByTanggal(data.tanggal);
  if (existing) {
    throw new Error('Hari libur pada tanggal tersebut sudah ada');
  }

  const result = await hariLiburRepository.createHariLibur(data);
  return result;
};

/**
 * Mengupdate hari libur
 * @param {string} tanggal - Tanggal hari libur
 * @param {Object} data - Data yang akan diupdate
 * @returns {Promise<Object>} - Data hari libur yang diupdate
 */
export const updateHariLibur = async (tanggal, data) => {
  // Cek apakah data exist
  const existing = await hariLiburRepository.findHariLiburByTanggal(tanggal);
  if (!existing) {
    throw new Error('Hari libur tidak ditemukan');
  }

  // Tidak boleh mengubah tanggal (primary key)
  delete data.tanggal;

  await hariLiburRepository.updateHariLibur(tanggal, data);

  // Get updated data
  const updated = await hariLiburRepository.findHariLiburByTanggal(tanggal);
  return updated;
};

/**
 * Menghapus hari libur
 * @param {string} tanggal - Tanggal hari libur
 * @returns {Promise<void>}
 */
export const deleteHariLibur = async (tanggal) => {
  const existing = await hariLiburRepository.findHariLiburByTanggal(tanggal);
  if (!existing) {
    throw new Error('Hari libur tidak ditemukan');
  }

  await hariLiburRepository.deleteHariLibur(tanggal);
};

/**
 * Mendapatkan hari libur dalam range tanggal
 * @param {string} startDate - Tanggal mulai
 * @param {string} endDate - Tanggal akhir
 * @returns {Promise<Array>} - Array hari libur
 */
export const getHariLiburByDateRange = async (startDate, endDate) => {
  const result = await hariLiburRepository.findHariLiburByDateRange(startDate, endDate);
  return result;
};

/**
 * Mengecek apakah tanggal adalah hari libur
 * @param {string} tanggal - Tanggal yang akan dicek
 * @returns {Promise<Object>} - Object dengan status dan data
 */
export const checkIsHoliday = async (tanggal) => {
  const result = await hariLiburRepository.findHariLiburByTanggal(tanggal);
  return {
    is_holiday: result !== null,
    data: result,
  };
};

/**
 * Bulk create atau update hari libur
 * @param {Array} dataArray - Array data hari libur
 * @returns {Promise<Object>} - Result dengan jumlah created dan updated
 */
export const bulkUpsertHariLibur = async (dataArray) => {
  const result = await hariLiburRepository.bulkCreateHariLibur(dataArray);
  return {
    total_processed: result.length,
    data: result,
  };
};
