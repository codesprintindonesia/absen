// src/services/laporan/realisasiLembur/create.service.js

import createRepository from "../../../repositories/laporan/realisasiLembur/create.repository.js";

const createService = async (data) => {
  return await createRepository(data);
};

export default createService;