// src/repositories/master/hariLibur/read.repository.js
import { HariLibur } from '../../../models/master/hariLibur.model.js';
import { Op } from 'sequelize';

/**
 * Repository untuk read hari libur
 * Direct database operation only
 * @param {Object} options - Query options
 * @returns {Object} List hari libur dengan count
 */
const read = async (options = {}) => {
  const { page = 1, limit = 20, filters = {}, orderBy = [['tanggal', 'ASC']] } = options;
  
  const offset = (page - 1) * limit;
  const where = {}; 

  // Search by nama or keterangan
  if (filters.search) {
    where[Op.or] = [
      { nama: { [Op.iLike]: `%${filters.search}%` } },
      { keterangan: { [Op.iLike]: `%${filters.search}%` } }
    ];
  }

  const result = await HariLibur.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: orderBy,
  });

  return {
    rows: result.rows.map(row => row.toJSON()),
    count: result.count
  };
};

export default read;