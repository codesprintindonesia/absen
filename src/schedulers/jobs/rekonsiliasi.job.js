// ================================================================
// src/schedulers/jobs/rekonsiliasi.job.js
// Job executor untuk rekonsiliasi absensi harian
// ================================================================

import prosesRekonsiliasi from "../../services/transactional/absensiHarian/rekonsiliasi.service.js";

/**
 * Execute rekonsiliasi absensi harian
 * @param {Object} [params] - Job parameters
 * @param {string} [params.tanggal] - Tanggal to process (YYYY-MM-DD), default: yesterday
 * @param {boolean} [params.skipWeekend=false] - Skip if weekend
 * @returns {Promise<void>}
 */
export const jalankanRekonsiliasi = async (params = {}) => {
  console.log("📝 Starting rekonsiliasi absensi harian job...");

  // Determine target date
  let targetDate;
  if (params.tanggal) {
    targetDate = new Date(params.tanggal);
  } else {
    // Default: yesterday (H-1)
    targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 1);
  }
  targetDate.setHours(0, 0, 0, 0);

  // Skip weekend if configured
  if (params.skipWeekend) {
    const dayOfWeek = targetDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      console.log(`⚠️  Skipping rekonsiliasi - ${targetDate.toDateString()} is a weekend`);
      return;
    }
  }

  console.log(`📅 Processing date: ${targetDate.toISOString()}`);

  // Execute rekonsiliasi
  await prosesRekonsiliasi(targetDate);

  console.log("✅ Rekonsiliasi job completed");
};

export default jalankanRekonsiliasi;
