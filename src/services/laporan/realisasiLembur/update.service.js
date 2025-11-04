// src/services/laporan/realisasiLembur/update.service.js

import updateRepository from "../../../repositories/laporan/realisasiLembur/update.repository.js";
import getByIdRepository from "../../../repositories/laporan/realisasiLembur/getById.repository.js";

const updateService = async (id, data) => {
  const existing = await getByIdRepository(id);
  
  if (!existing) {
    const error = new Error("Data realisasi lembur tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  const updated = await updateRepository(id, data);
  
  return updated;
};

export default updateService;