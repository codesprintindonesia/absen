// ================================================================
// src/schedulers/jobs/generateShiftBulanan.job.js
// Job executor untuk generate shift harian bulanan (bulan depan)
// ================================================================

import { generateShiftHarianPegawaiService } from "../../services/transactional/shiftHarianPegawai/generate.service.js";

/**
 * Execute generate shift harian untuk bulan depan (all employees, mode: skip)
 * Pure service call - no parameters, static behavior
 * @returns {Promise<void>}
 */
export const jalankanGenerateShiftBulanan = async () => {
  console.log("📆 Starting generate shift harian bulanan job...");

  // Calculate next month date range
  const now = new Date();

  // First day of next month
  const firstDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const tanggalMulai = firstDay.toISOString().substring(0, 10); // YYYY-MM-DD

  // Last day of next month
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const tanggalAkhir = lastDay.toISOString().substring(0, 10); // YYYY-MM-DD

  console.log(`📅 Generating shifts for period: ${tanggalMulai} to ${tanggalAkhir}`);
  console.log(`👥 Target: All employees`);
  console.log(`🔧 Mode: skip`);

  // Execute generation service
  const result = await generateShiftHarianPegawaiService({
    tanggalMulai,
    tanggalAkhir,
    idPegawai: null, // All employees
    mode: "skip", // Skip existing records
  });

  if (result.success) {
    console.log(`✅ Generated ${result.data.totalGenerated} shift records`);
    console.log(`   Employees: ${result.data.totalPegawai}`);
    console.log(`   Date range: ${result.data.dateRange.start} to ${result.data.dateRange.end}`);

    if (result.data.errors && result.data.errors.length > 0) {
      console.log(`⚠️  ${result.data.errors.length} errors occurred:`);
      result.data.errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.id_pegawai}: ${err.error}`);
      });
    }
  } else {
    console.log(`❌ Generation failed: ${result.message}`);
  }

  console.log("✅ Generate shift bulanan job completed");
};

export default jalankanGenerateShiftBulanan;
