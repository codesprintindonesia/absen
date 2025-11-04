// src/repositories/relational/lokasiKerjaPegawai/findActivePriority.repository.js

import { LokasiKerjaPegawai } from "../../../models/relational/lokasiKerjaPegawai.model.js";

const findActivePriority = async (idPegawai, options = {}) => {
  const lokasiKerja = await LokasiKerjaPegawai.findOne({
    where: {
      id_pegawai: idPegawai,
      is_active: true,
    },
    order: [['prioritas_lokasi', 'ASC']],
    raw: true,
    ...options,
  });

  return lokasiKerja;
};

export default findActivePriority;