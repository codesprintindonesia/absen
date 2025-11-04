import findByIdRepository from "../../../repositories/relational/shiftPegawai/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const getByIdService = async (id) => {
  const detail = await findByIdRepository(id);
  if (!detail) {
    const error = new Error("SHIFT_PEGAWAI_NOT_FOUND");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }
  return detail;
};

export default getByIdService;
