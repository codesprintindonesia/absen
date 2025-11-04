// src/repositories/transactional/shiftHarianPegawai/create.repository.js

import { ShiftHarianPegawai } from "../../../models/transactional/shiftHarianPegawai.model.js";

const create = async (data, options = {}) => {
  const shiftHarian = await ShiftHarianPegawai.create({
    id: data.id,
    id_pegawai: data.idPegawai,
    tanggal_kerja: data.tanggalKerja,
    id_shift_kerja_jadwal: data.shiftJadwal,
    id_shift_kerja_aktual: data.shiftAktual,
    id_lokasi_kerja_jadwal: data.lokasiJadwal,
    id_lokasi_kerja_aktual: data.lokasiAktual,
    nama_pegawai: data.namaPegawai,
    id_personal: data.idPersonal,
  }, options);

  return shiftHarian.toJSON();
};

export default create;