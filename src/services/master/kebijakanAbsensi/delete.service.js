import deleteRepository from '../../../repositories/master/kebijakanAbsensi/delete.repository.js';
import findByIdRepository from '../../../repositories/master/kebijakanAbsensi/findById.repository.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

/**
 * Business logic untuk menghapus kebijakan absensi (hard delete).
 */
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
    deleted_policy: existing,
    deleted_by: deletedBy,
    deleted_at: new Date().toISOString(),
  };
};

export default deleteKebijakanAbsensi;  // ← default export
