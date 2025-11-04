// src/services/master/kebijakanAbsensi/read.service.js
import readRepository from '../../../repositories/master/kebijakanAbsensi/read.repository.js';

/**
 * Business logic untuk read kebijakan absensi
 * @param {Object} queryParams - Query parameters (sudah tervalidasi oleh Joi middleware)
 * @returns {Object} List kebijakan absensi dengan metadata pagination
 */
const readService = async (queryParams) => {
  const { page = 1, limit = 20, is_active, search } = queryParams;
  
  // Build filter object
  const filters = {}; 
  if (is_active !== undefined) filters.is_active = is_active;
  if (search) filters.search = search; // Search akan dihandle di repository
  
  // Business logic: Default sorting berdasarkan created_at terbaru
  const options = {
    page,
    limit,
    filters,
    orderBy: [['created_at', 'DESC']]
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
    locations: result.rows,
    metadata
  };
};

export default readService;