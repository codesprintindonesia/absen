// src/repositories/transactional/shiftHarianPegawai/deleteByPegawaiAndTanggal.repository.js

import { ShiftHarianPegawai } from "../../../models/transactional/shiftHarianPegawai.model.js";

const deleteByPegawaiAndTanggal = async (idPegawai, tanggal, options = {}) => {
  return await ShiftHarianPegawai.destroy({
    where: {
      id_pegawai: idPegawai,
      tanggal_kerja: tanggal,
    },
    ...options,
  });
};

export default deleteByPegawaiAndTanggal;