import updateRepository from "../../../repositories/transactional/logRawAbsensi/update.repository.js";
import findByIdRepository from "../../../repositories/transactional/logRawAbsensi/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * Update log raw absensi by ID
 * @param {string} id - Log raw absensi ID
 * @param {Object} updateData - Data to update
 * @param {string} [updateData.waktu_log] - Log timestamp
 * @param {string} [updateData.id_lokasi_kerja] - Work location ID
 * @param {string} [updateData.source_absensi] - Attendance source
 * @param {string} [updateData.status_validasi] - Validation status
 * @param {string} [updatedBy="SYSTEM"] - User ID who updated the record
 * @returns {Promise<Object>} Updated log raw absensi record
 * @throws {Error} LOG_RAW_ABSENSI_NOT_FOUND if record not found
 */
const updateService = async (id, updateData, updatedBy = "SYSTEM") => {
  const existing = await findByIdRepository(id);
  if (!existing) {
    const error = new Error("LOG_RAW_ABSENSI_NOT_FOUND");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  const payload = {
    ...updateData,
    updated_by: updatedBy,
    updated_at: new Date(),
  };

  return await updateRepository(id, payload);
};

export default updateService;
