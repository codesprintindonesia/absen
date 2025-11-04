import createRepository from "../../../repositories/relational/lokasiKerjaPegawai/create.repository.js";
import readRepository from "../../../repositories/relational/lokasiKerjaPegawai/read.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const createService = async (data) => { 
  // jalankan insert ke database
  const result = await createRepository(data);
  return result;
};

export default createService;
