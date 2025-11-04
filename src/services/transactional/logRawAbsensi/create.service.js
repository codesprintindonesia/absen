import createRepository from "../../../repositories/transactional/logRawAbsensi/create.repository.js";

const createService = async (data) => {
  // validasi bisnis ringan bisa diletakkan di sini bila perlu
  return await createRepository(data);
};

export default createService;
