// src/services/master/shiftKerja/delete.service.js
import deleteRepository from '../../../repositories/master/shiftKerja/delete.repository.js';
import findByIdRepository from '../../../repositories/master/shiftKerja/findById.repository.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const deleteShiftKerja = async (id, deletedBy = 'SYSTEM') => {
  const existing = await findByIdRepository(id);
  if (!existing) {
    const err = new Error('SHIFT_KERJA_NOT_FOUND');
    err.statusCode = HTTP_STATUS.NOT_FOUND;
    throw err;
  }
  const deletedCount = await deleteRepository(id);
  if (deletedCount === 0) {
    throw new Error('DELETE_FAILED');
  }
  return {
    deleted_shift: existing,
    deleted_by: deletedBy,
    deleted_at: new Date().toISOString(),
  };
};

export default deleteShiftKerja;
