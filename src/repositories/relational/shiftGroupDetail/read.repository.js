import { ShiftGroupDetail } from "../../../models/relational/shiftGroupDetail.model.js";

const readRepository = async (params, options = {}) => {
  const { page, limit, filters, orderBy } = params;
  const where = {};

  if (filters.id_shift_group) where.id_shift_group = filters.id_shift_group;
  if (filters.id_shift_kerja) where.id_shift_kerja = filters.id_shift_kerja;  

  const offset = (page - 1) * limit;

  const result = await ShiftGroupDetail.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: orderBy || [["created_at", "DESC"]],
    ...options,
  });

  return {
    rows: result.rows.map((r) => r.toJSON()),
    count: result.count,
  };
};

export default readRepository;
