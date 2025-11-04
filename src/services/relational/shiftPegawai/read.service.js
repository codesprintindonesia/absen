import readRepository from "../../../repositories/relational/shiftPegawai/read.repository.js";

const readService = async (queryParams) => {
  const {
    page = 1,
    limit = 20,
    id_pegawai,
    id_shift_kerja,
    id_shift_group,
    is_active,
  } = queryParams;

  const filters = {};
  if (id_pegawai) filters.id_pegawai = id_pegawai;
  if (id_shift_kerja) filters.id_shift_kerja = id_shift_kerja;
  if (id_shift_group) filters.id_shift_group = id_shift_group;
  if (typeof is_active !== "undefined") filters.is_active = is_active === "true" || is_active === true;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    filters,
    orderBy: [["created_at", "DESC"]],
  };

  const result = await readRepository(options);

  return {
    items: result.rows,
    metadata: {
      page: options.page,
      limit: options.limit,
      total: result.count,
      totalPages: Math.ceil(result.count / options.limit),
      hasNext: options.page * options.limit < result.count,
      hasPrev: options.page > 1,
    },
  };
};

export default readService;
