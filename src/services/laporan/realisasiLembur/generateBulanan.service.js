// src/services/laporan/realisasiLembur/generateBulanan.service.js 

import { getAbsensiHarianByPegawaiAndPeriode } from "../../../repositories/laporan/realisasiLembur/getAbsensiHarianByPegawaiAndPeriode.repository.js";
import { getPegawaiListByPeriode } from "../../../repositories/laporan/realisasiLembur/getPegawaiListByPeriode.repository.js";
import { findRealisasiLembur } from "../../../repositories/laporan/realisasiLembur/findRealisasiLembur.repository.js";
import { createRealisasiLembur } from "../../../repositories/laporan/realisasiLembur/createRealisasiLembur.repository.js";
import { updateRealisasiLembur } from "../../../repositories/laporan/realisasiLembur/updateRealisasiLembur.repository.js";
import { getSequelize } from "../../../libraries/databaseInstance.library.js";

/**
 * BUSINESS LOGIC LAYER
 * Menangani semua kalkulasi dan orchestration
 */

/**
 * Generate ID untuk realisasi lembur
 * Format: LEM-{ID_PEGAWAI}-{YYYYMM}
 */
const generateRealisasiLemburId = (idPegawai, periodeBulan) => {
  const date = new Date(periodeBulan);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `LEM-${idPegawai}-${year}${month}`;
};

/**
 * Hitung statistik dari data absensi
 * PURE FUNCTION - Tidak ada side effects
 */
const hitungStatistikAbsensi = (dataAbsensi) => {
  let totalJamLemburBulanan = 0;
  let totalHariTerlambat = 0;
  let totalMenitKeterlambatan = 0;
  let totalHariTidakHadir = 0;
  let totalHariKerjaEfektif = 0;
  let jumlahHariTerlambat = 0;

  for (const absensi of dataAbsensi) {
    const jamLembur = parseFloat(absensi.jam_lembur_dihitung || 0);
    const menitTerlambat = parseInt(absensi.menit_keterlambatan || 0);
    const jamKerja = parseFloat(absensi.total_jam_kerja_efektif || 0);
    const statusKehadiran = absensi.status_kehadiran;

    totalJamLemburBulanan += jamLembur;

    if (menitTerlambat > 0) {
      totalHariTerlambat++;
      jumlahHariTerlambat++;
      totalMenitKeterlambatan += menitTerlambat;
    }

    if (statusKehadiran === "Alpa" || statusKehadiran === "Cuti" || statusKehadiran === "Izin") {
      totalHariTidakHadir++;
    }

    if (jamKerja > 0) {
      totalHariKerjaEfektif++;
    }
  }

  return {
    totalJamLemburBulanan: parseFloat(totalJamLemburBulanan.toFixed(2)),
    totalHariTerlambat,
    totalMenitKeterlambatan,
    totalHariTidakHadir,
    totalHariKerjaEfektif,
    jumlahHariTerlambat,
  };
};

/**
 * Generate realisasi lembur untuk SATU pegawai
 * @param {string} idPegawai - ID pegawai
 * @param {string} periodeBulan - Format: YYYY-MM-DD atau YYYY-MM-01
 * @param {Object} transaction - Transaction yang HARUS disediakan dari luar
 * @returns {Object} Result dengan data dan summary
 */
const generateRealisasiLemburBulanan = async (idPegawai, periodeBulan, transaction) => {
  // Validasi transaction HARUS ada
  if (!transaction) {
    throw new Error("Transaction is required for generateRealisasiLemburBulanan");
  }

  // Parse periode bulan
  const periodeDate = new Date(periodeBulan);
  const tahun = periodeDate.getFullYear();
  const bulan = periodeDate.getMonth() + 1;
  const tanggalAwal = new Date(tahun, bulan - 1, 1);
  const tanggalAkhir = new Date(tahun, bulan, 0);

  // Ambil data absensi dari repository
  const dataAbsensi = await getAbsensiHarianByPegawaiAndPeriode(
    idPegawai,
    tanggalAwal,
    tanggalAkhir,
    { transaction }
  );

  if (dataAbsensi.length === 0) {
    throw new Error(
      `Tidak ada data absensi untuk pegawai ${idPegawai} pada periode ${periodeBulan}`
    );
  }

  // Hitung statistik dari data absensi (pure function)
  const stats = hitungStatistikAbsensi(dataAbsensi);

  // Ambil data pegawai dari record pertama (untuk denormalisasi)
  const firstRecord = dataAbsensi[0];
  const namaPegawai = firstRecord.nama_pegawai || "";
  const idPersonal = firstRecord.id_personal || "";

  // Normalize periode bulan ke tanggal 1
  const periodeBulanNormalized = new Date(tahun, bulan - 1, 1);

  // Buat data realisasi lembur
  const dataRealisasiLembur = {
    id: generateRealisasiLemburId(idPegawai, periodeBulanNormalized),
    id_pegawai: idPegawai,
    periode_bulan_lembur: periodeBulanNormalized,
    total_jam_lembur_bulanan: stats.totalJamLemburBulanan,
    total_hari_terlambat: stats.totalHariTerlambat,
    total_menit_keterlambatan: stats.totalMenitKeterlambatan,
    total_hari_tidak_hadir: stats.totalHariTidakHadir,
    total_hari_kerja_efektif: stats.totalHariKerjaEfektif,
    id_personal: idPersonal,
    nama_pegawai: namaPegawai,
  };

  // Cek apakah data sudah ada
  const existing = await findRealisasiLembur(
    idPegawai,
    periodeBulanNormalized,
    { transaction }
  );

  let result;
  if (existing) {
    // Update existing
    result = await updateRealisasiLembur(
      existing.id,
      dataRealisasiLembur,
      { transaction }
    );
  } else {
    // Create new
    result = await createRealisasiLembur(
      dataRealisasiLembur,
      { transaction }
    );
  }

  return {
    success: true,
    data: result.toJSON ? result.toJSON() : result,
    summary: {
      total_hari_diproses: dataAbsensi.length,
      total_jam_lembur: stats.totalJamLemburBulanan,
      total_hari_terlambat: stats.totalHariTerlambat,
      total_hari_kerja_efektif: stats.totalHariKerjaEfektif,
    },
  };
};

/**
 * Generate realisasi lembur untuk SEMUA pegawai
 * TRANSACTION MANAGEMENT DI SINI
 * 
 * @param {string} periodeBulan - Format: YYYY-MM-DD
 * @returns {Object} Summary hasil generate
 */
const generateRealisasiLemburBulananAllPegawai = async (periodeBulan) => {
  const sequelize = await getSequelize();
  
  // SINGLE TRANSACTION untuk semua operasi
  const transaction = await sequelize.transaction();

  try {
    // Parse periode
    const periodeDate = new Date(periodeBulan);
    const tahun = periodeDate.getFullYear();
    const bulan = periodeDate.getMonth() + 1;
    const tanggalAwal = new Date(tahun, bulan - 1, 1);
    const tanggalAkhir = new Date(tahun, bulan, 0);

    // Ambil daftar pegawai unik
    const pegawaiList = await getPegawaiListByPeriode(
      tanggalAwal,
      tanggalAkhir,
      sequelize,
      { transaction }
    );

    if (pegawaiList.length === 0) {
      throw new Error(`Tidak ada data absensi untuk periode ${periodeBulan}`);
    }

    const results = [];
    const errors = [];

    // Process setiap pegawai dalam TRANSACTION YANG SAMA
    for (const pegawai of pegawaiList) {
      try {
        // Pass transaction yang sama ke function child
        const result = await generateRealisasiLemburBulanan(
          pegawai.id_pegawai,
          periodeBulan,
          transaction // PENTING: Gunakan transaction yang sama
        );
        
        results.push({
          id_pegawai: pegawai.id_pegawai,
          status: "success",
          data: result,
        });
      } catch (error) {
        // Jika ada error di satu pegawai, catat tapi lanjutkan
        errors.push({
          id_pegawai: pegawai.id_pegawai,
          status: "error",
          error: error.message,
        });
      }
    }

    // Jika ada error, rollback semua
    if (errors.length > 0) {
      await transaction.rollback();
      
      return {
        success: false,
        periode: periodeBulan,
        total_pegawai: pegawaiList.length,
        total_success: results.length,
        total_error: errors.length,
        results,
        errors,
        message: "Beberapa pegawai gagal diproses, semua perubahan dibatalkan",
      };
    }

    // Commit hanya jika semua sukses
    await transaction.commit();

    return {
      success: true,
      periode: periodeBulan,
      total_pegawai: pegawaiList.length,
      total_success: results.length,
      total_error: errors.length,
      results,
      errors,
    };
  } catch (error) {
    // Rollback HANYA SEKALI di sini jika belum di-rollback
    if (!transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

export { generateRealisasiLemburBulanan, generateRealisasiLemburBulananAllPegawai };