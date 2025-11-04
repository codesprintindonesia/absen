// src/repositories/transactional/shiftHarianPegawai/updateByRange.repository.js
import { ShiftHarianPegawai } from '../../../models/transactional/shiftHarianPegawai.model.js';
import { Op } from 'sequelize';

const updateByRange = async (idPegawai, tanggalMulai, tanggalAkhir, updateData, options = {}) => {
  const [count] = await ShiftHarianPegawai.update(updateData, {
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

export default updateByRange;