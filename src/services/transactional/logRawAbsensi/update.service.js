import updateRepository from "../../../repositories/transactional/logRawAbsensi/update.repository.js";
import findByIdRepository from "../../../repositories/transactional/logRawAbsensi/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

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
