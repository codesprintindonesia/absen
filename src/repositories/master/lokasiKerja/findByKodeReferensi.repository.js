import { LokasiKerja } from '../../../models/master/lokasiKerja.model.js';
import { Op } from 'sequelize';

/**
 * Repository untuk check duplicate kode referensi
 * Direct database operation only
 * @param {string} kodeReferensi - Kode referensi lokasi
 * @param {string} excludeId - ID yang dikecualikan dari pengecekan
 * @returns {Object|null} Data lokasi kerja atau null jika tidak ditemukan
 */
const findByKodeReferensi = async (kodeReferensi, excludeId = null, options = {}) => {
  const whereClause = { kode_referensi: kodeReferensi };
  
  if (excludeId) {
    whereClause.id = { [Op.ne]: excludeId };
  }
  
  const location = await LokasiKerja.findOne({ where: whereClause }, options);
  return location ? location.toJSON() : null;
};

export default findByKodeReferensi;