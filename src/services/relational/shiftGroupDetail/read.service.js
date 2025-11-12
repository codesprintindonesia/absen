import readRepository from "../../../repositories/relational/shiftGroupDetail/read.repository.js";

/**
 * Business logic untuk read shift group detail dengan pagination dan filter
 * @param {Object} queryParams - Query parameters
 * @param {number} [queryParams.page=1] - Halaman yang diminta
 * @param {number} [queryParams.limit=20] - Jumlah item per halaman
 * @param {string} [queryParams.id_shift_group] - Filter berdasarkan shift group ID
 * @param {string} [queryParams.id_shift_kerja] - Filter berdasarkan shift kerja ID
 * @returns {Promise<{items: Array, metadata: Object}>} List shift group detail dengan metadata pagination
 */
const readService = async (queryParams) => {
  const {
    page = 1,
    limit = 20,
    id_shift_group,
    id_shift_kerja,  
  } = queryParams;

  // siapkan filter
  const filters = {};
  if (id_shift_group) filters.id_shift_group = id_shift_group;
  if (id_shift_kerja) filters.id_shift_kerja = id_shift_kerja;  

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    filters,
    orderBy: [["created_at", "DESC"]],
  };

  const result = await readRepository(options);

  const metadata = {
    page: parseInt(page),
    limit: parseInt(limit),
    total: result.count,
    totalPages: Math.ceil(result.count / limit),
    hasNext: (page * limit) < result.count,
    hasPrev: page > 1,
  };

  return {
    items: result.rows,
    metadata,
  };
};

export default readService;
