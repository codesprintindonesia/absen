import findByIdRepository from "../../../repositories/relational/lokasiKerjaPegawai/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const getById = async (id) => {
  const detail = await findByIdRepository(id);
  if (!detail) {
    const error = new Error("LOKASI_KERJA_PEGAWAI_NOT_FOUND");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }
  return detail;
};

export default getById;
