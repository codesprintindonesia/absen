// src/services/transactional/absensiHarian/rekonsiliasi.service.js

import * as rekonRepo from '../../../repositories/transactional/absensiHarian/rekonsiliasi.repository.js';
import { 
  createTransaction, 
  commitTransaction, 
  rollbackTransaction 
} from '../../../libraries/transaction.library.js';

/**
 * Helper: Extract time from datetime string
 */
const extractTime = (datetimeString) => {
  if (!datetimeString) return null;
  const date = new Date(datetimeString);
  return date.toTimeString().slice(0, 8);
};

/**
 * Helper: Group logs by pegawai
 */
const groupLogsByPegawai = (logs) => {
  return logs.reduce((acc, log) => {
    if (!acc[log.id_pegawai]) {
      acc[log.id_pegawai] = [];
    }
    acc[log.id_pegawai].push(log);
    return acc;
  }, {});
};

/**
 * Helper: Format tanggal ke string "YYYYMMDD"
 */
const formatTanggal = (tanggal) => {
  // Jika parameter adalah objek Date
  if (tanggal instanceof Date) {
    return tanggal.toISOString().slice(0, 10).replace(/-/g, "");
  }

  // Jika parameter sudah berupa string
  if (typeof tanggal === "string") {
    return tanggal.slice(0, 10).replace(/-/g, "");
  }

  throw new Error("Parameter 'tanggal' harus berupa string (YYYY-MM-DD) atau Date object");
};

/**
 * Helper: Generate ID Absensi
 */
const generateAbsensiId = (idPegawai, tanggal) => {
  const dateStr = formatTanggal(tanggal);
  return `ABS-${idPegawai}-${dateStr}`;
};

/**
 * Helper: Generate ID Proses
 */
const generateIdProses = (tanggal) => {
  const dateStr = formatTanggal(tanggal);
  const timestamp = Date.now().toString().slice(-6); // ambil 6 digit terakhir dari timestamp
  return `PRC-${dateStr}-${timestamp}`;
};


/**
 * Helper: Check if shift lintas hari
 */
const isShiftLintasHari = (jamMasuk, jamPulang) => {
  if (!jamMasuk || !jamPulang) return false;
  return jamPulang < jamMasuk;
};

/**
 * Helper: Hitung keterlambatan dalam menit
 */
const hitungKeterlambatan = (jamMasukJadwal, jamMasukAktual, toleransi = 0) => {
  if (!jamMasukJadwal || !jamMasukAktual) return 0;
  
  const jadwal = new Date(`1970-01-01T${jamMasukJadwal}`);
  const aktual = new Date(`1970-01-01T${jamMasukAktual}`);
  
  const diffMinutes = Math.floor((aktual - jadwal) / (1000 * 60));
  const terlambat = diffMinutes - toleransi;
  
  return terlambat > 0 ? terlambat : 0;
};

/**
 * Helper: Hitung pulang cepat dalam menit
 */
const hitungPulangCepat = (jamPulangJadwal, jamPulangAktual) => {
  if (!jamPulangJadwal || !jamPulangAktual) return 0;
  
  const jadwal = new Date(`1970-01-01T${jamPulangJadwal}`);
  const aktual = new Date(`1970-01-01T${jamPulangAktual}`);
  
  const diffMinutes = Math.floor((jadwal - aktual) / (1000 * 60));
  
  return diffMinutes > 0 ? diffMinutes : 0;
};

/**
 * Helper: Hitung total jam kerja efektif
 */
const hitungJamKerjaEfektif = (jamMasuk, jamPulang, durasiIstirahat = 0) => {
  if (!jamMasuk || !jamPulang) return 0;
  
  const masuk = new Date(`1970-01-01T${jamMasuk}`);
  let pulang = new Date(`1970-01-01T${jamPulang}`);
  
  // Handle lintas hari
  if (pulang < masuk) {
    pulang = new Date(`1970-01-02T${jamPulang}`);
  }
  
  const totalMinutes = Math.floor((pulang - masuk) / (1000 * 60));
  const efektifMinutes = totalMinutes - durasiIstirahat;
  
  return Math.max(0, parseFloat((efektifMinutes / 60).toFixed(2)));
};

/**
 * Helper: Hitung jam lembur
 */
const hitungJamLembur = (totalJamKerja, jamKerjaNormal = 8) => {
  const lembur = totalJamKerja - jamKerjaNormal;
  return lembur > 0 ? parseFloat(lembur.toFixed(2)) : 0;
};

/**
 * Helper: Tentukan status kehadiran
 * BUSINESS RULES:
 * 1. Tidak ada log masuk DAN tidak ada log pulang → Alpa
 * 2. Ada log masuk TAPI tidak ada log pulang → Alpa (dengan catatan)
 * 3. Ada log masuk DAN ada log pulang:
 *    - Terlambat > toleransi → Terlambat
 *    - Pulang cepat > 0 → Pulang_Cepat
 *    - Normal → Hadir
 */
const tentukanStatusKehadiran = (logMasuk, logPulang, keterlambatan, pulangCepat) => {
  // Rule 1: Tidak ada log masuk dan tidak ada log pulang
  if (!logMasuk && !logPulang) {
    return 'Alpa';
  }
  
  // Rule 2: Ada log masuk tapi tidak ada log pulang
  if (logMasuk && !logPulang) {
    return 'Alpa';  // Status tetap Alpa, catatan akan ditambahkan di function caller
  }
  
  // Rule 3: Ada log masuk dan ada log pulang
  if (logMasuk && logPulang) {
    if (keterlambatan > 0) {
      return 'Terlambat';
    }
    if (pulangCepat > 0) {
      return 'Pulang_Cepat';
    }
    return 'Hadir';
  }
  
  // Fallback (seharusnya tidak pernah terjadi)
  return 'Alpa';
};

/**
 * Helper: Validasi lokasi log
 */
const validateLokasi = (logLokasiId, shiftLokasiId, shiftLokasiNama, lokasiPegawai) => {
  // Level 1: Cek sesuai dengan lokasi shift
  if (logLokasiId === shiftLokasiId) {
    return { valid: true, catatan: null };
  }
  
  // Level 2: Cek apakah ada di lokasi pegawai yang terdaftar
  const lokasiTerdaftar = lokasiPegawai.find(lok => lok.id_lokasi_kerja === logLokasiId);
  
  if (lokasiTerdaftar) {
    return {
      valid: true,
      catatan: `Log dilakukan di ${lokasiTerdaftar.nama_lokasi}, bukan di lokasi jadwal ${shiftLokasiNama}`
    };
  }
  
  // Tidak ditemukan sama sekali
  return {
    valid: true,
    catatan: 'Log dilakukan di lokasi tidak terdaftar'
  };
};

/**
 * Proses absensi untuk satu pegawai
 * PENTING: Function ini dipanggil dalam transaction context
 * 
 * @param {string} tanggal - Tanggal proses
 * @param {Object} jadwal - Data jadwal shift pegawai
 * @param {Array} logs - Array of raw logs pegawai
 * @param {Object} kebijakan - Kebijakan absensi aktif
 * @param {Array} lokasiPegawai - Array of lokasi kerja pegawai
 * @param {Object} options - Options dengan transaction
 */
const prosesAbsensiPegawai = async (
  tanggal, 
  jadwal, 
  logs, 
  kebijakan, 
  lokasiPegawai,
  options = {}
) => {
  // 1. Identifikasi log masuk dan pulang
  const sortedLogs = logs.sort((a, b) => new Date(a.waktu_log) - new Date(b.waktu_log));
  const logMasuk = sortedLogs[0] || null;
  const logPulang = sortedLogs.length > 1 ? sortedLogs[sortedLogs.length - 1] : null;
  
  // 2. Extract waktu
  const jamMasukAktual = logMasuk ? extractTime(logMasuk.waktu_log) : null;
  const jamPulangAktual = logPulang ? extractTime(logPulang.waktu_log) : null;
  
  // 3. Kalkulasi metrik
  const keterlambatanMenit = hitungKeterlambatan(
    jadwal.jam_masuk,
    jamMasukAktual,
    jadwal.toleransi_keterlambatan || kebijakan.toleransi_keterlambatan || 0
  );
  
  const pulangCepatMenit = hitungPulangCepat(
    jadwal.jam_pulang,
    jamPulangAktual
  );
  
  const totalJamKerja = hitungJamKerjaEfektif(
    jamMasukAktual,
    jamPulangAktual,
    jadwal.durasi_istirahat || 0
  );
  
  const jamLembur = hitungJamLembur(totalJamKerja);
  
  // 4. Tentukan status kehadiran
  const statusKehadiran = tentukanStatusKehadiran(
    logMasuk,
    logPulang,
    keterlambatanMenit,
    pulangCepatMenit
  );
  
  // 5. Build catatan khusus
  const catatan = [];
  
  // CRITICAL: Tambahkan catatan jika ada log masuk tapi tidak ada log pulang
  if (logMasuk && !logPulang) {
    catatan.push('Tidak absen pulang');
  }
  
  // Catatan untuk keterlambatan
  if (keterlambatanMenit > 0) {
    catatan.push(`Terlambat ${keterlambatanMenit} menit`);
  }
  
  // Catatan untuk pulang cepat
  if (pulangCepatMenit > 0) {
    catatan.push(`Pulang cepat ${pulangCepatMenit} menit`);
  }
  
  // Catatan untuk lembur
  if (jamLembur > 0) {
    catatan.push(`Lembur ${jamLembur} jam`);
  }
  
  // Validasi lokasi jika ada log masuk
  if (logMasuk) {
    const validasiLokasi = validateLokasi(
      logMasuk.id_lokasi_kerja,
      jadwal.id_lokasi_kerja,
      jadwal.nama_lokasi,
      lokasiPegawai
    );
    
    if (validasiLokasi.catatan) {
      catatan.push(validasiLokasi.catatan);
    }
  }
  
  // 6. Prepare data untuk insert
  const absensiData = {
    id: generateAbsensiId(jadwal.id_pegawai, tanggal),
    id_pegawai: jadwal.id_pegawai,
    tanggal_absensi: tanggal,
    id_shift_kerja: jadwal.id_shift_kerja,
    id_lokasi_kerja_digunakan: logMasuk?.id_lokasi_kerja || jadwal.id_lokasi_kerja,
    jam_masuk_jadwal: jadwal.jam_masuk,
    jam_pulang_jadwal: jadwal.jam_pulang,
    jam_masuk_aktual: jamMasukAktual,
    jam_keluar_istirahat_aktual: null,
    jam_masuk_istirahat_aktual: null,
    jam_pulang_aktual: jamPulangAktual,
    id_log_masuk: logMasuk?.id || null,
    id_log_keluar_istirahat: null,
    id_log_masuk_istirahat: null,
    id_log_pulang: logPulang?.id || null,
    status_kehadiran: statusKehadiran,
    menit_keterlambatan: keterlambatanMenit,
    menit_pulang_cepat: pulangCepatMenit,
    total_jam_kerja_efektif: totalJamKerja,
    jam_lembur_dihitung: jamLembur,
    tanggal_kerja_efektif: tanggal,
    is_shift_lintas_hari: isShiftLintasHari(jadwal.jam_masuk, jadwal.jam_pulang),
    id_kebijakan_absensi: kebijakan.id,
    catatan_khusus: catatan.length > 0 ? catatan.join(', ') : null,
    is_data_final: false,
    nama_pegawai: jadwal.nama_pegawai,
    id_personal: jadwal.id_personal
  };
  
  // 7. Insert dengan transaction
  await rekonRepo.insertAbsensiHarian(absensiData, options);
};

/**
 * Main service: Proses rekonsiliasi untuk satu tanggal
 * 
 * BUSINESS LOGIC:
 * 1. PRE-CHECK: Cek semua pegawai apakah sudah ada data absensi
 * 2. Jika ADA yang sudah punya data → Return error dengan daftar pegawai
 * 3. Jika SEMUA belum ada data → Lanjut proses rekonsiliasi
 * 4. Selalu insert log ke s_proses_harian
 * 
 * @param {string} tanggal - Tanggal dalam format YYYY-MM-DD
 * @returns {Object} Result proses rekonsiliasi
 */
export const prosesRekonsiliasi = async (tanggal) => {
  const waktuMulai = new Date();
  let totalPegawai = 0;
  let totalBerhasil = 0;
  const idProses = generateIdProses(tanggal);
  
  const transaction = await createTransaction({
    isolationLevel: 'READ COMMITTED'
  });
  
  try {
    console.log(`[${new Date().toISOString()}] Memulai rekonsiliasi untuk tanggal: ${tanggal}`);
    
    // 1. Ambil data yang diperlukan
    const [shiftHarian, rawLogs, kebijakan] = await Promise.all([
      rekonRepo.getShiftHarianByDate(tanggal, { transaction }),
      rekonRepo.getRawAbsensiByDate(tanggal, { transaction }),
      rekonRepo.getKebijakanAbsensiAktif({ transaction })
    ]);
    
    if (!kebijakan) {
      throw new Error('Kebijakan absensi tidak ditemukan atau tidak aktif');
    }
    
    console.log(`[${new Date().toISOString()}] Data ditemukan - Shift: ${shiftHarian.length}, Logs: ${rawLogs.length}`);
    
    totalPegawai = shiftHarian.length;
    
    // 2. FAST CHECK: Apakah tanggal ini sudah ada data absensi?
    console.log(`[${new Date().toISOString()}] Cek apakah tanggal ${tanggal} sudah memiliki data absensi...`);
    
    const hasData = await rekonRepo.checkAbsensiExistsByDate(tanggal, { transaction });
    
    if (hasData) {
      console.log(`[${new Date().toISOString()}] Data absensi untuk tanggal ${tanggal} sudah ada`);
      
      const error = new Error(`Data absensi untuk tanggal ${tanggal} sudah ada. Gunakan koreksi absensi jika perlu mengubah data.`);
      error.code = 'DUPLICATE_ABSENSI_DATA';
      error.tanggal = tanggal;
      throw error;
    }
    
    console.log(`[${new Date().toISOString()}] Tanggal ${tanggal} belum ada data - Lanjut proses`);
    
    // 3. Group logs by pegawai
    const logsByPegawai = groupLogsByPegawai(rawLogs);
    
    // 4. Proses setiap pegawai
    for (const jadwal of shiftHarian) {
      const lokasiPegawai = await rekonRepo.getLokasiKerjaPegawai(
        jadwal.id_pegawai, 
        tanggal, 
        { transaction }
      );
      
      const pegawaiLogs = logsByPegawai[jadwal.id_pegawai] || [];
      
      await prosesAbsensiPegawai(
        tanggal, 
        jadwal, 
        pegawaiLogs, 
        kebijakan, 
        lokasiPegawai,
        { transaction }
      );
      
      totalBerhasil++;
      console.log(`[${new Date().toISOString()}] ✓ Berhasil: ${jadwal.nama_pegawai}`);
    }
    
    // 5. Log hasil proses
    const waktuSelesai = new Date();
    const durasiDetik = Math.floor((waktuSelesai - waktuMulai) / 1000);
    
    await rekonRepo.insertLogProsesHarian({
      id: idProses,
      tanggal_proses: tanggal,
      jenis_proses: 'REKONSILIASI',
      status_proses: 'SUCCESS',
      waktu_mulai: waktuMulai,
      waktu_selesai: waktuSelesai,
      total_data_diproses: totalPegawai,
      jumlah_success: totalBerhasil,
      jumlah_error: 0,
      detail_error: null,
      catatan: `Rekonsiliasi berhasil. ${totalBerhasil} dari ${totalPegawai} pegawai dalam ${durasiDetik} detik.`
    }, { transaction });
    
    // COMMIT
    await commitTransaction(transaction);
    
    console.log(`[${new Date().toISOString()}] ✓ Rekonsiliasi selesai: ${totalBerhasil}/${totalPegawai}`);
    
    return {
      success: true,
      tanggal,
      total_pegawai: totalPegawai,
      berhasil: totalBerhasil,
      gagal: 0,
      durasi_detik: durasiDetik
    };
    
  } catch (error) {
    // ROLLBACK TRANSACTION (HANYA SEKALI)
    await rollbackTransaction(transaction);
    
    console.error(`[${new Date().toISOString()}] ✗ Rekonsiliasi gagal:`, error.message);
    
    // Log ke database (TANPA transaction karena sudah rollback)
    const waktuSelesai = new Date();
    const durasiDetik = Math.floor((waktuSelesai - waktuMulai) / 1000);
    
    try {
      await rekonRepo.insertLogProsesHarian({
        id: idProses,
        tanggal_proses: tanggal,
        jenis_proses: 'REKONSILIASI',
        status_proses: 'FAILED',
        waktu_mulai: waktuMulai,
        waktu_selesai: waktuSelesai,
        total_data_diproses: totalPegawai,
        jumlah_success: 0,
        jumlah_error: totalPegawai,
        detail_error: JSON.stringify(
          error.code === 'DUPLICATE_ABSENSI_DATA' 
            ? { alasan: 'Data absensi sudah ada', tanggal }
            : { error: error.message, stack: error.stack }
        ),
        catatan: error.code === 'DUPLICATE_ABSENSI_DATA'
          ? `Rekonsiliasi dibatalkan karena data absensi untuk tanggal ${tanggal} sudah ada.`
          : `Error: ${error.message}. Durasi: ${durasiDetik} detik.`
      });
    } catch (logError) {
      console.error(`[${new Date().toISOString()}] ✗ Gagal insert log:`, logError.message);
    }
    
    throw error;
  }
};