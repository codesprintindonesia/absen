// ================================================================
// src/schedulers/jobs/rekonsiliasi.job.js
// Job executor untuk rekonsiliasi absensi harian (H-1)
// ================================================================

import { prosesRekonsiliasi } from "../../services/transactional/absensiHarian/rekonsiliasi.service.js";

/**
 * Execute rekonsiliasi absensi harian untuk kemarin (H-1)
 * Pure service call - no parameters, static behavior
 * @returns {Promise<void>}
 */
export const jalankanRekonsiliasi = async () => {
  console.log("📝 Starting rekonsiliasi absensi harian job...");

  // Calculate yesterday (H-1)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - 1);
  targetDate.setHours(0, 0, 0, 0);

  console.log(`📅 Processing date: ${targetDate.toISOString()}`);

  // Execute rekonsiliasi service
  await prosesRekonsiliasi(targetDate);

  console.log("✅ Rekonsiliasi job completed");
};

export default jalankanRekonsiliasi;
