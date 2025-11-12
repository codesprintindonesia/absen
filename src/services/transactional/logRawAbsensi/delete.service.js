import deleteRepository from "../../../repositories/transactional/logRawAbsensi/delete.repository.js";
import findByIdRepository from "../../../repositories/transactional/logRawAbsensi/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * Delete log raw absensi by ID
 * @param {string} id - Log raw absensi ID
 * @param {string} [deletedBy="SYSTEM"] - User ID who deleted the record
 * @returns {Promise<Object>} Deletion result with deleted record details
 * @returns {Promise<Object>} result.deleted_detail - Details of deleted record
 * @returns {Promise<string>} result.deleted_by - User who deleted the record
 * @returns {Promise<string>} result.deleted_at - Deletion timestamp
 * @throws {Error} LOG_RAW_ABSENSI_NOT_FOUND if record not found
 * @throws {Error} DELETE_FAILED if deletion failed
 */
const deleteService = async (id, deletedBy = "SYSTEM") => {
  const existing = await findByIdRepository(id);
  if (!existing) {
    const error = new Error("LOG_RAW_ABSENSI_NOT_FOUND");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  const count = await deleteRepository(id);
  if (count === 0) {
    const error = new Error("DELETE_FAILED");
    error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw error;
  }

  return {
    deleted_detail: existing,
    deleted_by: deletedBy,
    deleted_at: new Date().toISOString(),
  };
};

export default deleteService;
