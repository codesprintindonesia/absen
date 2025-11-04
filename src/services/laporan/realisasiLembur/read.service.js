// src/services/laporan/realisasiLembur/read.service.js

import readRepository from "../../../repositories/laporan/realisasiLembur/read.repository.js";

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