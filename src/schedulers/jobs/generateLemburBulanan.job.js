// ================================================================
// src/schedulers/jobs/generateLemburBulanan.job.js
// Job executor untuk generate laporan lembur bulanan
// ================================================================

import { generateRealisasiLemburBulananAllPegawai } from "../../services/laporan/realisasiLembur/generateBulanan.service.js";

/**
 * Execute generate laporan lembur bulanan untuk semua pegawai
 * @param {Object} [params] - Job parameters
 * @param {string} [params.periodeBulan] - Period month (YYYY-MM-DD), default: last month
 * @param {number} [params.offsetMonth=1] - How many months back (1 = last month, 2 = 2 months ago)
 * @returns {Promise<void>}
 */
export const jalankanGenerateLemburBulanan = async (params = {}) => {
  console.log("📊 Starting generate laporan lembur bulanan job...");

  // Determine period
  let periodeBulan;
  if (params.periodeBulan) {
    periodeBulan = new Date(params.periodeBulan);
  } else {
    // Default: last month
    const offsetMonth = params.offsetMonth || 1;
    periodeBulan = new Date();
    periodeBulan.setMonth(periodeBulan.getMonth() - offsetMonth);
  }

  // Normalize to first day of month
  periodeBulan.setDate(1);
  periodeBulan.setHours(0, 0, 0, 0);

  const periodStr = periodeBulan.toISOString().substring(0, 7); // YYYY-MM

  console.log(`📅 Processing period: ${periodStr}`);

  // Execute generation
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
