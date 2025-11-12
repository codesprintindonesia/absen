// ================================================================
// src/services/system/auditLog/read.service.js
// Service untuk business logic get audit logs
// ================================================================

import readRepository from '../../../repositories/system/auditLog/read.repository.js';

/**
 * Read audit logs with pagination and filters
 * @param {Object} queryParams - Query parameters
 * @param {string} [queryParams.nama_tabel] - Filter by table name
 * @param {string} [queryParams.id_record] - Filter by record ID
 * @param {string} [queryParams.jenis_aksi] - Filter by action type (INSERT/UPDATE/DELETE)
 * @param {string} [queryParams.id_user_pelaku] - Filter by user ID
 * @param {string} [queryParams.start_date] - Filter by start date
 * @param {string} [queryParams.end_date] - Filter by end date
 * @param {number} [queryParams.page=1] - Page number
 * @param {number} [queryParams.limit=50] - Records per page (max 100)
 * @returns {Promise<Object>} Result with items and pagination metadata
 * @returns {Promise<Array>} result.items - Array of audit log records
 * @returns {Promise<Object>} result.metadata - Pagination metadata
 */
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