// src/repositories/master/hariLibur/delete.repository.js
import { HariLibur } from '../../../models/master/hariLibur.model.js';

/**
 * Repository untuk delete hari libur
 * Direct database operation only
 * @param {string} tanggal - Tanggal hari libur (PK)
 * @returns {number} Jumlah rows yang dihapus
 */
const deleteHariLibur = async (tanggal, options = {}) => {
  const deletedCount = await HariLibur.destroy({
    where: { tanggal },
    ...options
  });
  
  return deletedCount;
};

export default deleteHariLibur;