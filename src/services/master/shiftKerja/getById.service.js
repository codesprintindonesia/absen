// src/services/master/shiftKerja/getById.service.js
import findByIdRepository from '../../../repositories/master/shiftKerja/findById.repository.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

/**
 * Business logic untuk get shift kerja by ID
 * @param {string} id - ID shift kerja
 * @returns {Promise<Object>} Data shift kerja
 */
const getById = async (id) => {
  const record = await findByIdRepository(id);
  if (!record) {
    const err = new Error('SHIFT_KERJA_NOT_FOUND');
    err.statusCode = HTTP_STATUS.NOT_FOUND;
    throw err;
  }
  return record;
};

export default getById;
