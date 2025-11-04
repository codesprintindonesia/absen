// ================================================================
// src/services/system/auditLog/read.service.js
// Service untuk business logic get audit logs
// ================================================================

import readRepository from '../../../repositories/system/auditLog/read.repository.js';

const readService = async (queryParams) => {
  const {
    nama_tabel,
    id_record,
    jenis_aksi,
    id_user_pelaku,
    start_date,
    end_date,
    page = 1,
    limit = 50,
  } = queryParams;

  // Validate & sanitize
  const sanitizedLimit = Math.min(parseInt(limit), 100);
  const sanitizedPage = Math.max(parseInt(page), 1);

  // Build params
  const params = {
    page: sanitizedPage,
    limit: sanitizedLimit,
    filters: {
      nama_tabel,
      id_record,
      jenis_aksi,
      id_user_pelaku,
      start_date,
      end_date,
    },
    orderBy: [['created_at', 'DESC']],
  };

  // Get data from repository
  const result = await readRepository(params);

  // Return transformed result
  return {
    items: result.rows,
    metadata: {
      total: result.count,
      page: sanitizedPage,
      limit: sanitizedLimit,
      totalPages: Math.ceil(result.count / sanitizedLimit),
    },
  };
};

export default readService;