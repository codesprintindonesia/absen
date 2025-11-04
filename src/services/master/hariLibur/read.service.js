// src/services/master/hariLibur/read.service.js
import readRepository from '../../../repositories/master/hariLibur/read.repository.js';

/**
 * Business logic untuk read hari libur
 * @param {Object} queryParams - Query parameters (sudah tervalidasi oleh Joi middleware)
 * @returns {Object} List hari libur dengan metadata pagination
 */
const read = async (queryParams) => {
  const { page, limit, search } = queryParams;
  
  // Build filter object
  const filters = {}; 
  if (search) filters.search = search;
  
  // Business logic: Default sorting berdasarkan tanggal ascending
  const options = {
    page,
    limit,
    filters,
    orderBy: [['tanggal', 'ASC']]
  };
  
  // Get data dari repository
  const result = await readRepository(options);
  
  // Transform response dengan metadata pagination
  const metadata = {
    page: parseInt(page),
    limit: parseInt(limit),
    total: result.count,
    totalPages: Math.ceil(result.count / limit),
    hasNext: (page * limit) < result.count,
    hasPrev: page > 1
  };
  
  return {
    holidays: result.rows,
    metadata
  };
};

export default read;