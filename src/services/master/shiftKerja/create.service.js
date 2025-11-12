// src/services/master/shiftKerja/create.service.js
import createRepository from '../../../repositories/master/shiftKerja/create.repository.js';

/**
 * Business logic untuk create shift kerja baru
 * @param {Object} data - Data shift kerja yang akan dibuat
 * @returns {Promise<Object>} Data shift kerja yang baru dibuat
 */
const createService = async (data) => { 
  const newData = {
    ...data,
    is_active: data.is_active !== undefined ? data.is_active : true, 
  };
  return await createRepository(newData);
};

export default createService;
