// src/repositories/relational/shiftPegawai/findActive.repository.js

import { ShiftPegawai } from "../../../models/relational/shiftPegawai.model.js";

const findActive = async (idPegawai = null, options = {}) => {
  const whereClause = { is_active: true };
  
  if (idPegawai) {
    whereClause.id_pegawai = idPegawai;
  }

  return await ShiftPegawai.findAll({
    where: whereClause,
    raw: true,
    ...options,
  });
};

export default findActive;