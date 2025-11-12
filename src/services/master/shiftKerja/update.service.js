// src/services/master/shiftKerja/update.service.js
import updateRepository from '../../../repositories/master/shiftKerja/update.repository.js';
import findByIdRepository from '../../../repositories/master/shiftKerja/findById.repository.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

/**
 * Business logic untuk update shift kerja
 * @param {string} id - ID shift kerja yang akan diupdate
 * @param {Object} updateData - Data yang akan diupdate
 * @param {string} [updatedBy='SYSTEM'] - Nama user yang mengupdate
 * @returns {Promise<Object>} Data shift kerja yang sudah diupdate
 */
const updateService = async (id, updateData, updatedBy = 'SYSTEM') => {
 
  const existing = await findByIdRepository(id);
  if (!existing) {
    const err = new Error('SHIFT_KERJA_NOT_FOUND');
    err.statusCode = HTTP_STATUS.NOT_FOUND;
    throw err;
  }  

  const dataToUpdate = {
    ...updateData,
    updated_by: updatedBy,
    updated_at: new Date(),
  };
  return await updateRepository(id, dataToUpdate);
};

export default updateService;
