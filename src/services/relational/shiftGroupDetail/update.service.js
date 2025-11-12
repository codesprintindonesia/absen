import updateRepository from "../../../repositories/relational/shiftGroupDetail/update.repository.js";
import findByIdRepository from "../../../repositories/relational/shiftGroupDetail/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * Business logic untuk update shift group detail
 * @param {string} id - ID shift group detail yang akan diupdate
 * @param {Object} updateData - Data yang akan diupdate
 * @param {string} [updatedBy='SYSTEM'] - Nama user yang mengupdate
 * @returns {Promise<Object>} Data shift group detail yang sudah diupdate
 */
const updateService = async (id, updateData, updatedBy = "SYSTEM") => {
  const existing = await findByIdRepository(id);
  if (!existing) {
    const error = new Error("SHIFT_GROUP_DETAIL_NOT_FOUND");
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

export default updateService;
