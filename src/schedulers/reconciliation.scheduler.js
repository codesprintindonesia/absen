// ================================================================
// src/schedulers/reconciliation.scheduler.js
// Main scheduler untuk rekonsiliasi absensi harian otomatis
// Eksekusi: Setiap hari jam 02:00 WIB untuk data H-1
// ================================================================

import cron from "node-cron";
import { Op } from "sequelize";

// Import models sesuai naming convention project
import { LogRawAbsensi } from "../models/transactional/logRawAbsensi.model.js";
import AbsensiHarian from "../models/absensiHarian.model.js";
import ShiftHarianPegawai from "../models/transactional/shiftHarianPegawai.model.js";
import { ShiftKerja } from "../models/master/shiftKerja.model.js";
import { KebijakanAbsensi } from "../models/master/kebijakanAbsensi.model.js";
import ProsesHarian from "../models/prosesHarian.models.js";

// ================================================================
// HELPER FUNCTIONS
// ================================================================

const generateAbsensiId = (idPegawai, tanggal) => {
  const dateStr = tanggal.toISOString().slice(0, 10).replace(/-/g, "");
  return `ABS-${idPegawai}-${dateStr}`;
};

const generateProsesId = (tanggal, sequence = "001") => {
  const dateStr = tanggal.toISOString().slice(0, 10).replace(/-/g, "");
  return `PRC-${dateStr}-${sequence}`;
};

const hitungMenitTerlambat = (jamJadwal, jamAktual) => {
  if (!jamJadwal || !jamAktual) return 0;

  const jadwal = new Date(`1970-01-01T${jamJadwal}`);
  const aktual = new Date(`1970-01-01T${jamAktual}`);

  const selisihMenit = (aktual - jadwal) / (1000 * 60);
  return selisihMenit > 0 ? Math.round(selisihMenit) : 0;
};

const hitungJamKerjaEfektif = (jamMasuk, jamPulang, durasiIstirahat = 60) => {
  if (!jamMasuk || !jamPulang) return 0;

  const masuk = new Date(`1970-01-01T${jamMasuk}`);
  let pulang = new Date(`1970-01-01T${jamPulang}`);

  // Handle shift lintas hari (shift malam)
  if (pulang < masuk) {
    pulang.setDate(pulang.getDate() + 1);
  }

  const totalMenit = (pulang - masuk) / (1000 * 60);
  const jamKerjaEfektif = Math.max(0, totalMenit - durasiIstirahat) / 60;

  return parseFloat(jamKerjaEfektif.toFixed(2));
};

const tentukanStatusKehadiran = (adaLogMasuk, menitTerlambat, toleransi) => {
  if (!adaLogMasuk) return "Tidak Hadir";
  if (menitTerlambat > toleransi) return "Terlambat";
  return "Hadir";
};

const isShiftLintas = (jamMasuk, jamPulang) => {
  const masuk = new Date(`1970-01-01T${jamMasuk}`);
  const pulang = new Date(`1970-01-01T${jamPulang}`);
  return pulang < masuk;
};

const identifikasiLogMasukPulang = (logs) => {
  if (!logs || logs.length === 0) return { masuk: null, pulang: null };

  // Sort logs berdasarkan waktu
  const sortedLogs = logs.sort(
    (a, b) => new Date(a.waktu_log) - new Date(b.waktu_log)
  );

  // Logic sederhana: log pertama = masuk, log terakhir = pulang
  const masuk = sortedLogs[0];
  const pulang =
    sortedLogs.length > 1 ? sortedLogs[sortedLogs.length - 1] : null;

  return { masuk, pulang };
};

// ================================================================
// CORE BUSINESS LOGIC
// ================================================================

const prosesAbsensiSatuPegawai = async (idPegawai, tanggalProses) => {
  try {
    console.log(`Processing ${idPegawai} for ${tanggalProses.toDateString()}`);

    // 1. AMBIL JADWAL PEGAWAI
    const jadwal = await ShiftHarianPegawai.findOne({
      where: {
        id_pegawai: idPegawai,
        tanggal_kerja: tanggalProses,
      },
      include: [
        {
          model: ShiftKerja,
          as: "shiftJadwal",
          attributes: [
            "id",
            "nama",
            "jam_masuk",
            "jam_pulang",
            "durasi_istirahat",
          ],
        },
      ],
    });

    if (!jadwal || !jadwal.shiftJadwal) {
      console.log(`❌ No schedule found for ${idPegawai}`);
      return null;
    }

    const shift = jadwal.shiftJadwal;

    // 2. TENTUKAN RANGE WAKTU LOG
    const startTime = new Date(tanggalProses);
    const endTime = new Date(tanggalProses);
    endTime.setHours(23, 59, 59, 999);

    // Untuk shift malam (lintas hari), extend sampai besok pagi
    if (isShiftLintas(shift.jam_masuk, shift.jam_pulang)) {
      endTime.setDate(endTime.getDate() + 1);
      endTime.setHours(12, 0, 0, 0); // Sampai siang hari berikutnya
    }

    // 3. AMBIL LOG ABSENSI
    const rawLogs = await LogRawAbsensi.findAll({
      where: {
        id_pegawai: idPegawai,
        status_validasi: "VALID",
        waktu_log: { [Op.between]: [startTime, endTime] },
      },
      order: [["waktu_log", "ASC"]],
      attributes: ["id", "waktu_log", "source_absensi"],
    });

    // 4. IDENTIFIKASI LOG MASUK & PULANG
    const { masuk: logMasuk, pulang: logPulang } =
      identifikasiLogMasukPulang(rawLogs);

    if (!logMasuk) {
      console.log(`❌ No entry log found for ${idPegawai}`);
      return null;
    }

    // 5. AMBIL KEBIJAKAN ABSENSI
    const kebijakan = await KebijakanAbsensi.findOne({
      where: { is_default: true, is_active: true },
      attributes: ["id", "toleransi_keterlambatan"],
    });

    if (!kebijakan) {
      throw new Error("No default attendance policy found");
    }

    // 6. KALKULASI ABSENSI
    const jamMasukAktual = new Date(logMasuk.waktu_log)
      .toTimeString()
      .slice(0, 8);
    const jamPulangAktual = logPulang
      ? new Date(logPulang.waktu_log).toTimeString().slice(0, 8)
      : null;

    // Hitung keterlambatan
    const menitTerlambat = hitungMenitTerlambat(
      shift.jam_masuk,
      jamMasukAktual
    );

    // Hitung jam kerja efektif
    const totalJamKerjaEfektif = jamPulangAktual
      ? hitungJamKerjaEfektif(
          jamMasukAktual,
          jamPulangAktual,
          shift.durasi_istirahat
        )
      : 0;

    // Tentukan status kehadiran
    const statusKehadiran = tentukanStatusKehadiran(
      !!logMasuk,
      menitTerlambat,
      kebijakan.toleransi_keterlambatan
    );

    // Hitung lembur (simplified: jika > 8 jam)
    const jamLemburDihitung =
      totalJamKerjaEfektif > 8
        ? parseFloat((totalJamKerjaEfektif - 8).toFixed(2))
        : 0;

    // Cek apakah shift lintas hari
    const shiftLintasHari = isShiftLintas(shift.jam_masuk, shift.jam_pulang);

    // 7. SIAPKAN DATA ABSENSI
    const dataAbsensi = {
      id: generateAbsensiId(idPegawai, tanggalProses),
      id_pegawai: idPegawai,
      tanggal_absensi: tanggalProses,
      id_shift_kerja: shift.id,
      id_lokasi_kerja_digunakan: jadwal.id_lokasi_kerja_aktual || "LOK-0001",
      jam_masuk_jadwal: shift.jam_masuk,
      jam_pulang_jadwal: shift.jam_pulang,
      jam_masuk_aktual: jamMasukAktual,
      jam_pulang_aktual: jamPulangAktual,
      id_log_masuk: logMasuk.id,
      id_log_pulang: logPulang ? logPulang.id : null,
      status_kehadiran: statusKehadiran,
      menit_keterlambatan: menitTerlambat,
      menit_pulang_cepat: 0, // Simplified for now
      total_jam_kerja_efektif: totalJamKerjaEfektif,
      jam_lembur_dihitung: jamLemburDihitung,
      tanggal_kerja_efektif: tanggalProses,
      is_shift_lintas_hari: shiftLintasHari,
      id_kebijakan_absensi: kebijakan.id,
    };

    // 8. UPSERT DATA KE DATABASE
    const [record, wasCreated] = await AbsensiHarian.upsert(dataAbsensi, {
      where: {
        id_pegawai: idPegawai,
        tanggal_absensi: tanggalProses,
      },
    });

    console.log(
      `✅ ${idPegawai} - ${statusKehadiran} - ${
        wasCreated ? "Created" : "Updated"
      }`
    );
    return { record, wasCreated };
  } catch (error) {
    console.error(`❌ Error processing ${idPegawai}:`, error.message);
    throw error;
  }
};

// ================================================================
// MAIN RECONCILIATION PROCESS
// ================================================================

const jalankanRekonsiliasi = async (targetDate = null) => {
  const waktuMulai = new Date();

  // Tentukan tanggal yang akan diproses (default: H-1)
  const tanggalProses = targetDate ? new Date(targetDate) : new Date();
  if (!targetDate) {
    tanggalProses.setDate(tanggalProses.getDate() - 1);
  }
  tanggalProses.setHours(0, 0, 0, 0);

  console.log(
    `\n🚀 [${waktuMulai.toISOString()}] Starting reconciliation for ${tanggalProses.toDateString()}`
  );

  let totalDiproses = 0;
  let jumlahBerhasil = 0;
  let jumlahGagal = 0;
  const daftarError = [];

  // Generate process ID
  const prosesId = generateProsesId(tanggalProses);

  try {
    // 1. LOG MULAI PROSES
    await ProsesHarian.create({
      id: prosesId,
      tanggal_proses: tanggalProses,
      jenis_proses: "REKONSILIASI",
      status_proses: "RUNNING",
      waktu_mulai: waktuMulai,
      catatan: `Memulai rekonsiliasi absensi untuk ${tanggalProses.toDateString()}`,
    });

    // 2. AMBIL DAFTAR PEGAWAI YANG DIJADWALKAN
    const pegawaiTerjadwal = await ShiftHarianPegawai.findAll({
      where: { tanggal_kerja: tanggalProses },
      attributes: ["id_pegawai"],
      group: ["id_pegawai"],
    });

    totalDiproses = pegawaiTerjadwal.length;
    console.log(`📊 Found ${totalDiproses} employees scheduled for processing`);

    if (totalDiproses === 0) {
      console.log("⚠️  No employees scheduled for this date");

      await ProsesHarian.update(
        {
          status_proses: "SUCCESS",
          waktu_selesai: new Date(),
          total_data_diproses: 0,
          jumlah_success: 0,
          jumlah_error: 0,
          catatan: "Tidak ada pegawai terjadwal untuk tanggal ini",
        },
        { where: { id: prosesId } }
      );

      return;
    }

    // 3. PROSES SETIAP PEGAWAI
    for (const pegawai of pegawaiTerjadwal) {
      try {
        const hasil = await prosesAbsensiSatuPegawai(
          pegawai.id_pegawai,
          tanggalProses
        );

        if (hasil) {
          jumlahBerhasil++;
        } else {
          // Tidak ada log atau jadwal, tapi bukan error
          console.log(`⚠️  ${pegawai.id_pegawai} - No attendance data`);
        }

        // Small delay untuk mencegah overload database
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        jumlahGagal++;
        const errorInfo = {
          id_pegawai: pegawai.id_pegawai,
          error_message: error.message,
        };
        daftarError.push(errorInfo);

        console.error(`❌ ${pegawai.id_pegawai} - ${error.message}`);
      }
    }

    // 4. FINALISASI PROSES
    const waktuSelesai = new Date();
    const durasiDetik = Math.round((waktuSelesai - waktuMulai) / 1000);

    const statusAktual =
      jumlahGagal === 0 ? "SUCCESS" : jumlahBerhasil > 0 ? "PARTIAL" : "FAILED";

    await ProsesHarian.update(
      {
        status_proses: statusAktual,
        waktu_selesai: waktuSelesai,
        total_data_diproses: totalDiproses,
        jumlah_success: jumlahBerhasil,
        jumlah_error: jumlahGagal,
        detail_error: daftarError.length > 0 ? daftarError : null,
        catatan: `Rekonsiliasi selesai dalam ${durasiDetik}s. Berhasil: ${jumlahBerhasil}, Gagal: ${jumlahGagal}`,
      },
      { where: { id: prosesId } }
    );

    // 5. LOG HASIL
    console.log(
      `\n✅ [${waktuSelesai.toISOString()}] Reconciliation completed!`
    );
    console.log(
      `📈 Summary: ${jumlahBerhasil} success, ${jumlahGagal} failed, ${durasiDetik}s duration`
    );

    if (jumlahGagal > 0) {
      console.log(
        `❌ Failed employees:`,
        daftarError.map((e) => e.id_pegawai).join(", ")
      );
    }
  } catch (error) {
    // Error sistem/database
    const waktuSelesai = new Date();

    console.error(`💥 System error during reconciliation:`, error.message);

    try {
      await ProsesHarian.update(
        {
          status_proses: "FAILED",
          waktu_selesai: waktuSelesai,
          total_data_diproses: totalDiproses,
          jumlah_success: jumlahBerhasil,
          jumlah_error: jumlahGagal + 1,
          detail_error: [
            {
              system_error: error.message,
              stack: error.stack,
            },
          ],
          catatan: `Rekonsiliasi gagal total: ${error.message}`,
        },
        { where: { id: prosesId } }
      );
    } catch (updateError) {
      console.error("Failed to update process log:", updateError.message);
    }

    throw error;
  }
};

// ================================================================
// SCHEDULER SETUP
// ================================================================

const setupScheduler = () => {
  console.log("🕐 Setting up daily reconciliation scheduler...");

  // Cron job: Setiap hari jam 02:00 WIB
  cron.schedule(
    "0 2 * * *",
    async () => {
      console.log(
        "\n🎯 Daily reconciliation cron job triggered at",
        new Date().toISOString()
      );

      try {
        await jalankanRekonsiliasi();
      } catch (error) {
        console.error("💥 Cron job execution failed:", error.message);
        // Optional: Send alert notification
      }
    },
    {
      scheduled: true,
      timezone: process.env.TZ || "Asia/Makassar",
    }
  );

  console.log("✅ Daily reconciliation scheduler initialized (02:00 WIB)");
};

// ================================================================
// MANUAL EXECUTION & STATUS CHECK
// ================================================================

const jalankanManual = async (tanggal = null) => {
  console.log("\n🔧 Running manual reconciliation...");

  try {
    await jalankanRekonsiliasi(tanggal);
    console.log("✅ Manual reconciliation completed successfully");
  } catch (error) {
    console.error("❌ Manual reconciliation failed:", error.message);
    throw error;
  }
};

const cekStatus = async () => {
  const kemarin = new Date();
  kemarin.setDate(kemarin.getDate() - 1);
  kemarin.setHours(0, 0, 0, 0);

  try {
    const prosesStatus = await ProsesHarian.findOne({
      where: {
        tanggal_proses: kemarin,
        jenis_proses: "REKONSILIASI",
      },
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "status_proses",
        "waktu_mulai",
        "waktu_selesai",
        "total_data_diproses",
        "jumlah_success",
        "jumlah_error",
        "catatan",
      ],
    });

    return {
      tanggal_cek: kemarin.toDateString(),
      status: prosesStatus?.status_proses || "BELUM_JALAN",
      waktu_mulai: prosesStatus?.waktu_mulai,
      waktu_selesai: prosesStatus?.waktu_selesai,
      total_diproses: prosesStatus?.total_data_diproses || 0,
      berhasil: prosesStatus?.jumlah_success || 0,
      gagal: prosesStatus?.jumlah_error || 0,
      catatan: prosesStatus?.catatan,
      proses_id: prosesStatus?.id,
    };
  } catch (error) {
    console.error("Error checking reconciliation status:", error.message);
    return {
      tanggal_cek: kemarin.toDateString(),
      status: "ERROR",
      error: error.message,
    };
  }
};

// ================================================================
// EXPORTS
// ================================================================

export { setupScheduler, jalankanManual, cekStatus };
