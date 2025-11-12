// src/services/laporan/realisasiLembur/getById.service.js

import getByIdRepository from "../../../repositories/laporan/realisasiLembur/getById.repository.js";

/**
 * Get realisasi lembur by ID
 * @param {string} id - Realisasi lembur ID
 * @returns {Promise<Object>} Realisasi lembur record
 * @throws {Error} If record not found (404)
 */
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