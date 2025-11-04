// src/repositories/transactional/shiftHarianPegawai/findByRange.repository.js
import { ShiftHarianPegawai } from '../../../models/transactional/shiftHarianPegawai.model.js';
import { ShiftKerja } from '../../../models/master/shiftKerja.model.js';
import { LokasiKerja } from '../../../models/master/lokasiKerja.model.js';
import { Op } from 'sequelize';

const findByRange = async (filters, options = {}) => {
  const { idPegawai, tanggalMulai, tanggalAkhir } = filters;

  const where = {};
  
  if (idPegawai) {
    where.id_pegawai = idPegawai;
  }
  
  if (tanggalMulai && tanggalAkhir) {
    where.tanggal_kerja = {
      [Op.between]: [tanggalMulai, tanggalAkhir],
    };
  } else if (tanggalMulai) {
    where.tanggal_kerja = {
      [Op.gte]: tanggalMulai,
    };
  } else if (tanggalAkhir) {
    where.tanggal_kerja = {
      [Op.lte]: tanggalAkhir,
    };
  }

  const records = await ShiftHarianPegawai.findAll({
    where,
    include: [
      {
        model: ShiftKerja,
        as: 'shiftKerjaJadwal',
        attributes: ['id', 'nama', 'jam_masuk', 'jam_pulang'],
      },
      {
        model: ShiftKerja,
        as: 'shiftKerja',
        attributes: ['id', 'nama', 'jam_masuk', 'jam_pulang'],
      },
      {
        model: LokasiKerja,
        as: 'lokasiKerjaJadwal',
        attributes: ['id', 'nama', 'kode_referensi'],
      },
      {
        model: LokasiKerja,
        as: 'lokasiKerja',
        attributes: ['id', 'nama', 'kode_referensi'],
      },
    ],
    order: [['tanggal_kerja', 'ASC']],
    ...options,
  });

  return records.map(r => r.toJSON());
};

export default findByRange;