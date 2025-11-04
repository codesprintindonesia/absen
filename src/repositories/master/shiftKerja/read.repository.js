// src/repositories/master/shiftKerja/read.repository.js
import { ShiftKerja } from '../../../models/master/shiftKerja.model.js';
import { Op } from 'sequelize';

/**
 * List shift kerja dengan pagination dan filter
 * @param {Object} params { page, limit, filters, orderBy }
 */
const read = async (params, options = {}) => {
  const { page, limit, filters, orderBy } = params;

  const where = {};
  
  if (filters.is_active !== undefined) {
    where.is_active = filters.is_active;
  }
  if (filters.search) {
    where[Op.or] = [
      { nama: { [Op.iLike]: `%${filters.search}%` } }, 
    ];
  }

  const offset = (page - 1) * limit;

  const result = await ShiftKerja.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: orderBy || [['created_at', 'DESC']],
    ...options,
  });

  return {
    rows: result.rows.map((r) => r.toJSON()),
    count: result.count,
  };
};

export default read;
