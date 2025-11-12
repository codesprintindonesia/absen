import deleteRepository from "../../../repositories/relational/shiftGroupDetail/delete.repository.js";
import findByIdRepository from "../../../repositories/relational/shiftGroupDetail/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * Business logic untuk menghapus shift group detail
 * @param {string} id - ID shift group detail yang akan dihapus
 * @param {string} [deletedBy='SYSTEM'] - Nama user yang menghapus
 * @returns {Promise<Object>} Data shift group detail yang dihapus beserta metadata
 */
const deleteService = async (id, deletedBy = "SYSTEM") => {
  const existing = await findByIdRepository(id);
  if (!existing) {
    const error = new Error("SHIFT_GROUP_DETAIL_NOT_FOUND");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  const deletedCount = await deleteRepository(id);
  if (deletedCount === 0) {
    throw new Error("DELETE_FAILED");
  }

  return {
    deleted_detail: existing,
    deleted_by: deletedBy,
    deleted_at: new Date().toISOString(),
  };
};

export default deleteService;
