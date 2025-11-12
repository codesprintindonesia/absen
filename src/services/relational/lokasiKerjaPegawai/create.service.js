import createRepository from "../../../repositories/relational/lokasiKerjaPegawai/create.repository.js";
import readRepository from "../../../repositories/relational/lokasiKerjaPegawai/read.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import { generateLokasiKerjaPegawaiId } from "../../../utils/idGenerator.util.js";

/**
 * Business logic untuk create lokasi kerja pegawai
 * @param {Object} data - Data lokasi kerja pegawai yang akan dibuat
 * @returns {Promise<Object>} Data lokasi kerja pegawai yang baru dibuat
 */
const createService = async (data) => {
  // Generate ID otomatis dengan format LKP-{id_pegawai}-{8 digits}
  const generatedId = generateLokasiKerjaPegawaiId(data.id_pegawai);

  const lokasiKerjaPegawaiData = {
    ...data,
    id: generatedId, // Auto-generated ID
  };

  // jalankan insert ke database
  const result = await createRepository(lokasiKerjaPegawaiData);
  return result;
};

export default createService;
