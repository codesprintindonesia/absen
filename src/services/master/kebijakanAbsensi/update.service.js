import updateRepository from '../../../repositories/master/kebijakanAbsensi/update.repository.js';
import findByIdRepository from '../../../repositories/master/kebijakanAbsensi/findById.repository.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

/**
 * Business logic untuk mengupdate kebijakan absensi.
 */
const update = async (id, updateData, updatedBy = 'SYSTEM') => {
  const existing = await findByIdRepository(id);
  if (!existing) {
    const error = new Error('KEBIJAKAN_ABSENSI_NOT_FOUND');
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }
  const dataToUpdate = {
    ...updateData,
    updated_by: updatedBy,
    updated_at: new Date(),
  };
  return await updateRepository(id, dataToUpdate);
};

export default update;               // ← default export
