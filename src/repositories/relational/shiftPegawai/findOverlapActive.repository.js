import { Op } from "sequelize";
import { ShiftPegawai } from "../../../models/relational/shiftPegawai.model.js";

/**
 * Cek apakah ada shift aktif lain untuk pegawai yang overlap dgn periode baru.
 */
const findOverlapActiveRepository = async (
  { id_pegawai, tanggal_mulai, tanggal_akhir, excludeId },
  options = {}
) => {
  const andConditions = [
    { [Op.or]: [{ tanggal_akhir: null }, { tanggal_akhir: { [Op.gte]: tanggal_mulai } }] },
  ];

  if (tanggal_akhir !== null && tanggal_akhir !== undefined) {
    andConditions.push({ tanggal_mulai: { [Op.lte]: tanggal_akhir } });
  }

  const where = {
    id_pegawai,
    is_active: true,
    ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    [Op.and]: andConditions,
  };

  const row = await ShiftPegawai.findOne({ where, ...options });
  return row ? row.toJSON() : null;
};

export default findOverlapActiveRepository;
