import { ShiftPegawai } from "../../../models/relational/shiftPegawai.model.js";

const readRepository = async (params, options = {}) => {
  const { page, limit, filters = {}, orderBy } = params;
  const where = {};

  if (filters.id_pegawai) where.id_pegawai = filters.id_pegawai;
  if (filters.id_shift_kerja) where.id_shift_kerja = filters.id_shift_kerja;
  if (filters.id_shift_group) where.id_shift_group = filters.id_shift_group;
  if (typeof filters.is_active === "boolean") where.is_active = filters.is_active;

  const offset = (page - 1) * limit;

  const result = await ShiftPegawai.findAndCountAll({
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
