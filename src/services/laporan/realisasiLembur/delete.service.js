// src/services/laporan/realisasiLembur/delete.service.js

import deleteRepository from "../../../repositories/laporan/realisasiLembur/delete.repository.js";
import getByIdRepository from "../../../repositories/laporan/realisasiLembur/getById.repository.js";

const deleteService = async (id) => {
  const existing = await getByIdRepository(id);
  
  if (!existing) {
    const error = new Error("Data realisasi lembur tidak ditemukan");
    error.statusCode = 404;
    throw error;
  }

  const deletedCount = await deleteRepository(id);
  
  return deletedCount > 0;
};

export default deleteService;