import deleteRepository from '../../../repositories/master/shiftGroup/delete.repository.js';
import findByIdRepository from '../../../repositories/master/shiftGroup/findById.repository.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';
 
const deleteKebijakanAbsensi = async (id, deletedBy = 'SYSTEM') => {
  const existing = await findByIdRepository(id);
  if (!existing) {
    const error = new Error('KEBIJAKAN_ABSENSI_NOT_FOUND');
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
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

export default deleteKebijakanAbsensi;  // ← default export
