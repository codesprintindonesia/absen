import createRepository from "../../../repositories/relational/lokasiKerjaPegawai/create.repository.js";
import readRepository from "../../../repositories/relational/lokasiKerjaPegawai/read.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * Business logic untuk create lokasi kerja pegawai
 * @param {Object} data - Data lokasi kerja pegawai yang akan dibuat
 * @returns {Promise<Object>} Data lokasi kerja pegawai yang baru dibuat
 */
const createService = async (data) => { 
  // jalankan insert ke database
  const result = await createRepository(data);
  return result;
};

export default createService;
