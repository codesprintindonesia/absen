// src/services/laporan/realisasiLembur/getById.service.js

import getByIdRepository from "../../../repositories/laporan/realisasiLembur/getById.repository.js";

const getByIdService = async (id) => {
  const result = await getByIdRepository(id);
  
  if (!result) {
    const error = new Error("Data realisasi lembur tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  return result;
};

export default getByIdService;