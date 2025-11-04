import { Op } from "sequelize";
import { ShiftPegawai } from "../../../models/relational/shiftPegawai.model.js";

/**
 * Set is_active=false untuk assignment aktif lain yang overlap (kecuali excludeId).
 */
const deactivateOverlapsRepository = async (
  { id_pegawai, tanggal_mulai, tanggal_akhir = null, excludeId = null, updatedBy = "SYSTEM" },
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

    const [affected] = await ShiftPegawai.update(
      { is_active: false, updated_by: updatedBy, updated_at: new Date() },
      { where, ...options }
    );

    return affected;
};

export default deactivateOverlapsRepository;
