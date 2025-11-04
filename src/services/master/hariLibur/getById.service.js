// src/services/master/hariLibur/getById.service.js
import findByIdRepository from '../../../repositories/master/hariLibur/findById.repository.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

/**
 * Business logic untuk get hari libur by tanggal
 * @param {string} tanggal - Tanggal hari libur
 * @returns {Object} Data hari libur
 */
const getById = async (tanggal) => {
  const holiday = await findByIdRepository(tanggal);
  
  if (!holiday) {
    const error = new Error('HOLIDAY_NOT_FOUND');
    error.statusCode = HTTP_STATUS.NOT_FOUND; // 404
    throw error;
  }
  
  return holiday;
};

export default getById;