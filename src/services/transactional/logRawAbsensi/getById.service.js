import findByIdRepository from "../../../repositories/transactional/logRawAbsensi/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const getByIdService = async (id) => {
  const detail = await findByIdRepository(id);
  if (!detail) {
    const error = new Error("LOG_RAW_ABSENSI_NOT_FOUND");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }
  return detail;
};

export default getByIdService;
