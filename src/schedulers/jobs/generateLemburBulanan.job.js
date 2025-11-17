// ================================================================
// src/schedulers/jobs/generateLemburBulanan.job.js
// Job executor untuk generate laporan lembur bulanan (bulan lalu)
// ================================================================

import { generateRealisasiLemburBulananAllPegawai } from "../../services/laporan/realisasiLembur/generateBulanan.service.js";

/**
 * Execute generate laporan lembur bulanan untuk bulan lalu
 * Pure service call - no parameters, static behavior
 * @returns {Promise<void>}
 */
export const jalankanGenerateLemburBulanan = async () => {
  console.log("📊 Starting generate laporan lembur bulanan job...");

  // Calculate last month
  const periodeBulan = new Date();
  periodeBulan.setMonth(periodeBulan.getMonth() - 1);
  periodeBulan.setDate(1);
  periodeBulan.setHours(0, 0, 0, 0);

  const periodStr = periodeBulan.toISOString().substring(0, 7); // YYYY-MM

  console.log(`📅 Processing period: ${periodStr}`);

  // Execute generation service
  const result = await generateRealisasiLemburBulananAllPegawai(periodeBulan);

  if (result.success) {
    console.log(`✅ Generated lembur for ${result.total_success} employees`);
  } else {
    console.log(`⚠️  Generated with errors: ${result.total_success} success, ${result.total_error} errors`);
    if (result.errors && result.errors.length > 0) {
      console.log("Error details:", result.errors);
    }
  }

  console.log("✅ Generate lembur bulanan job completed");
};

export default jalankanGenerateLemburBulanan;
