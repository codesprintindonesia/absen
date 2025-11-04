// src/models/associations.model.js

/**
 * Sequelize Model Associations
 * File: src/models/associations.model.js
 * 
 * Setup relationships antar models untuk enable JOIN queries
 */

import { ShiftHarianPegawai } from "./transactional/shiftHarianPegawai.model.js";
import { ShiftKerja } from "./master/shiftKerja.model.js";
import { LokasiKerja } from "./master/lokasiKerja.model.js";
import { LokasiKerjaPegawai } from "./relational/lokasiKerjaPegawai.model.js";
import { AbsensiHarian } from "./transactional/absensiHarian.model.js";
import { LogRawAbsensi } from "./transactional/logRawAbsensi.model.js";

/**
 * Association untuk t_shift_harian_pegawai dengan m_shift_kerja
 * Relasi: Many-to-One (ShiftHarianPegawai -> ShiftKerja)
 */
ShiftHarianPegawai.belongsTo(ShiftKerja, {
  foreignKey: "id_shift_kerja_jadwal",
  as: "shiftKerjaJadwal",
  targetKey: "id",
});

ShiftHarianPegawai.belongsTo(ShiftKerja, {
  foreignKey: "id_shift_kerja_aktual",
  as: "shiftKerja",
  targetKey: "id",
});

/**
 * Association untuk t_shift_harian_pegawai dengan m_lokasi_kerja
 * Relasi: Many-to-One (ShiftHarianPegawai -> LokasiKerja)
 */
ShiftHarianPegawai.belongsTo(LokasiKerja, {
  foreignKey: "id_lokasi_kerja_jadwal",
  as: "lokasiKerjaJadwal",
  targetKey: "id",
});

ShiftHarianPegawai.belongsTo(LokasiKerja, {
  foreignKey: "id_lokasi_kerja_aktual",
  as: "lokasiKerja",
  targetKey: "id",
});

/**
 * Association untuk r_lokasi_kerja_pegawai dengan m_lokasi_kerja
 * Relasi: Many-to-One (LokasiKerjaPegawai -> LokasiKerja)
 */
LokasiKerjaPegawai.belongsTo(LokasiKerja, {
  foreignKey: "id_lokasi_kerja",
  as: "lokasiKerja",
  targetKey: "id",
});

/**
 * Association untuk t_absensi_harian dengan t_log_raw_absensi (log masuk)
 * Relasi: Many-to-One (AbsensiHarian -> LogRawAbsensi)
 */
AbsensiHarian.belongsTo(LogRawAbsensi, {
  foreignKey: "id_log_masuk",
  as: "logMasuk",
  targetKey: "id",
});

/**
 * Association untuk t_absensi_harian dengan t_log_raw_absensi (log pulang)
 * Relasi: Many-to-One (AbsensiHarian -> LogRawAbsensi)
 */
AbsensiHarian.belongsTo(LogRawAbsensi, {
  foreignKey: "id_log_pulang",
  as: "logPulang",
  targetKey: "id",
});

/**
 * Association untuk t_absensi_harian dengan m_shift_kerja
 * Relasi: Many-to-One (AbsensiHarian -> ShiftKerja)
 */
AbsensiHarian.belongsTo(ShiftKerja, {
  foreignKey: "id_shift_kerja",
  as: "shift",
  targetKey: "id",
});

/**
 * Association untuk t_absensi_harian dengan m_lokasi_kerja
 * Relasi: Many-to-One (AbsensiHarian -> LokasiKerja)
 */
AbsensiHarian.belongsTo(LokasiKerja, {
  foreignKey: "id_lokasi_kerja_digunakan",
  as: "lokasiKerja",
  targetKey: "id",
});

// Export empty object untuk konsistensi
export default {};