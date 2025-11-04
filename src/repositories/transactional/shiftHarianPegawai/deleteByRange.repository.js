// src/repositories/transactional/shiftHarianPegawai/deleteByRange.repository.js
import { ShiftHarianPegawai } from '../../../models/transactional/shiftHarianPegawai.model.js';
import { Op } from 'sequelize';

const deleteByRange = async (idPegawai, tanggalMulai, tanggalAkhir, options = {}) => {
  const count = await ShiftHarianPegawai.destroy({
    where: {
      id_pegawai: idPegawai,
      tanggal_kerja: {
        [Op.between]: [tanggalMulai, tanggalAkhir],
      },
    },
    ...options,
  });
  
  return count;
};

export default deleteByRange;