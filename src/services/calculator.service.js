/**
 * Pure calculation functions untuk absensi
 * File: src/services/calculator.service.js
 */

/**
 * Group raw logs by id_pegawai
 */
export const groupLogsByPegawai = (rawLogs) => {
  const grouped = {};

  rawLogs.forEach((log) => {
    if (!grouped[log.id_pegawai]) {
      grouped[log.id_pegawai] = [];
    }
    grouped[log.id_pegawai].push(log);
  });

  return grouped;
};

/**
 * Cari log masuk (source_absensi=1) pertama dan log pulang (source_absensi=2) terakhir
 */
export const findMasukPulang = (logs) => {
  const masukLogs = logs.filter((log) => log.source_absensi === 1);
  const pulangLogs = logs.filter((log) => log.source_absensi === 2);

  const logMasuk = masukLogs.length > 0 ? masukLogs[0] : null;
  const logPulang =
    pulangLogs.length > 0 ? pulangLogs[pulangLogs.length - 1] : null;

  return { logMasuk, logPulang };
};

/**
 * Hitung selisih waktu dalam menit
 */
export const hitungSelisihMenit = (waktuAwal, waktuAkhir) => {
  if (!waktuAwal || !waktuAkhir) return 0;

  const diff = new Date(waktuAkhir) - new Date(waktuAwal);
  return Math.floor(diff / 60000); // Convert ms to minutes
};

/**
 * Hitung keterlambatan dalam menit
 */
export const hitungKeterlambatan = (
  jamMasukJadwal,
  jamMasukAktual,
  toleransiMenit = 0
) => {
  if (!jamMasukJadwal || !jamMasukAktual) return 0;

  // Parse jam jadwal (format: "08:00:00")
  const [hourJadwal, minuteJadwal] = jamMasukJadwal.split(":");
  const jadwalMenit = parseInt(hourJadwal) * 60 + parseInt(minuteJadwal);

  // Parse jam aktual (format: Date object atau string)
  const aktualDate = new Date(jamMasukAktual);
  const aktualMenit = aktualDate.getHours() * 60 + aktualDate.getMinutes();

  const selisih = aktualMenit - jadwalMenit;
  const terlambat = selisih - toleransiMenit;

  return terlambat > 0 ? terlambat : 0;
};

/**
 * Hitung pulang cepat dalam menit
 */
export const hitungPulangCepat = (jamPulangJadwal, jamPulangAktual) => {
  if (!jamPulangJadwal || !jamPulangAktual) return 0;

  // Parse jam jadwal (format: "17:00:00")
  const [hourJadwal, minuteJadwal] = jamPulangJadwal.split(":");
  const jadwalMenit = parseInt(hourJadwal) * 60 + parseInt(minuteJadwal);

  // Parse jam aktual
  const aktualDate = new Date(jamPulangAktual);
  const aktualMenit = aktualDate.getHours() * 60 + aktualDate.getMinutes();

  const selisih = jadwalMenit - aktualMenit;

  return selisih > 0 ? selisih : 0;
};

/**
 * Hitung durasi kerja dalam menit (dikurangi waktu istirahat)
 * Untuk simplicity: hanya hitung selisih masuk-pulang
 */
export const hitungDurasiKerjaMenit = (jamMasuk, jamPulang, durasiIstirahatMenit = 0) => {
  if (!jamMasuk || !jamPulang) return 0;

  const totalMenit = hitungSelisihMenit(jamMasuk, jamPulang);
  const efektifMenit = totalMenit - durasiIstirahatMenit;

  return efektifMenit > 0 ? efektifMenit : 0;
};

/**
 * Convert menit ke jam (decimal)
 */
export const menitKeJam = (menit) => {
  return (menit / 60).toFixed(2);
};

/**
 * Hitung lembur dalam menit
 */
export const hitungLemburMenit = (
  durasiKerjaMenit,
  durasiIstirahatMenit,
  jamMasukJadwal,
  jamPulangJadwal
) => {
  if (!jamMasukJadwal || !jamPulangJadwal) return 0;

  // Hitung durasi jadwal dalam menit
  const [hourMasuk, minuteMasuk] = jamMasukJadwal.split(":");
  const [hourPulang, minutePulang] = jamPulangJadwal.split(":");

  const masukMenit = parseInt(hourMasuk) * 60 + parseInt(minuteMasuk);
  let pulangMenit = parseInt(hourPulang) * 60 + parseInt(minutePulang);

  // Handle shift lintas hari (contoh: 22:00 - 06:00)
  if (pulangMenit < masukMenit) {
    pulangMenit += 24 * 60; // Tambah 1 hari
  }

  const durasiJadwalMenit = pulangMenit - masukMenit - durasiIstirahatMenit;

  // Lembur = durasi kerja aktual - durasi jadwal
  const lemburMenit = durasiKerjaMenit - durasiJadwalMenit;

  return lemburMenit > 0 ? lemburMenit : 0;
};

/**
 * Tentukan status kehadiran
 */
export const tentukanStatusKehadiran = (
  logMasuk,
  logPulang,
  keterlambatanMenit,
  pulangCepatMenit
) => {
  // Tidak ada log masuk = tidak hadir
  if (!logMasuk) {
    return "Tidak Hadir";
  }

  // Ada log masuk, tidak ada log pulang
  if (!logPulang) {
    return "Terlambat"; // Anggap terlambat karena tidak pulang
  }

  // Ada log masuk dan pulang
  if (keterlambatanMenit > 0 && pulangCepatMenit > 0) {
    return "Terlambat dan Pulang Cepat";
  }

  if (keterlambatanMenit > 0) {
    return "Terlambat";
  }

  if (pulangCepatMenit > 0) {
    return "Pulang Cepat";
  }

  return "Hadir";
};

/**
 * Build catatan khusus berdasarkan kondisi absensi
 */
export const buildCatatanKhusus = (
  statusKehadiran,
  keterlambatanMenit,
  pulangCepatMenit,
  lemburJam
) => {
  const parts = [];

  if (statusKehadiran === "Tidak Hadir") {
    return "Tidak ada log kehadiran";
  }

  if (keterlambatanMenit > 0) {
    parts.push(`Terlambat ${keterlambatanMenit} menit`);
  }

  if (pulangCepatMenit > 0) {
    parts.push(`Pulang cepat ${pulangCepatMenit} menit`);
  }

  if (lemburJam > 0) {
    parts.push(`Lembur ${lemburJam} jam`);
  }

  if (!logPulang) {
    parts.push("Tidak ada log pulang");
  }

  return parts.length > 0 ? parts.join(", ") : null;
};