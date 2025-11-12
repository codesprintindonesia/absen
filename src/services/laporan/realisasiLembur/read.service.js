// src/services/laporan/realisasiLembur/read.service.js

import readRepository from "../../../repositories/laporan/realisasiLembur/read.repository.js";

/**
 * Read realisasi lembur with pagination and filters
 * @param {Object} queryParams - Query parameters
 * @param {number} [queryParams.page=1] - Page number
 * @param {number} [queryParams.limit=20] - Records per page
 * @param {string} [queryParams.id_pegawai] - Filter by employee ID
 * @param {string} [queryParams.periode_bulan_lembur] - Filter by overtime period
 * @param {boolean} [queryParams.is_data_final] - Filter by final data status
 * @param {string} [queryParams.search] - Search keyword
 * @returns {Promise<Object>} Result with items and pagination metadata
 * @returns {Promise<Array>} result.items - Array of realisasi lembur records
 * @returns {Promise<Object>} result.metadata - Pagination metadata
 */
const readService = async (queryParams) => {
  const { page = 1, limit = 20, id_pegawai, periode_bulan_lembur, is_data_final, search } = queryParams;
  
  const params = {
    page: parseInt(page),
    limit: parseInt(limit),
    filters: {
      id_pegawai,
      periode_bulan_lembur,
      is_data_final,
      search,
    },
  };
  
  const result = await readRepository(params);
  
  const totalPages = Math.ceil(result.count / limit);

  return {
    items: result.rows,
    metadata: {
      total: result.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
    },
  };
};

export default readService;