// src/repositories/transactional/shiftHarianPegawai/findByPegawaiAndTanggal.repository.js

import { ShiftHarianPegawai } from "../../../models/transactional/shiftHarianPegawai.model.js";

const findByPegawaiAndTanggal = async (idPegawai, tanggal, options = {}) => {
  return await ShiftHarianPegawai.findAll({
    where: {
      id_pegawai: idPegawai,
      tanggal_kerja: tanggal,
    },
    attributes: ["id"],
    raw: true,
    ...options,
  });
};

export default findByPegawaiAndTanggal;