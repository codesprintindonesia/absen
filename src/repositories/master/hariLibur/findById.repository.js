// src/repositories/master/hariLibur/findById.repository.js
import { HariLibur } from '../../../models/master/hariLibur.model.js';

/**
 * Repository untuk find hari libur by tanggal (PK)
 * Direct database operation only
 * @param {string} tanggal - Tanggal hari libur
 * @returns {Object|null} Data hari libur atau null
 */
const findById = async (tanggal, options = {}) => {
  const holiday = await HariLibur.findOne({ where: { tanggal }, ...options });
  return holiday ? holiday.toJSON() : null;
};

export default findById;