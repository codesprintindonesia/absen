// ================================================================
// src/schedulers/jobs/generateShiftBulanan.job.js
// Job executor untuk generate shift harian bulanan
// ================================================================

import { generateShiftHarianPegawaiService } from "../../services/transactional/shiftHarianPegawai/generate.service.js";

/**
 * Execute generate shift harian untuk bulan depan
 * @param {Object} [params] - Job parameters
 * @param {string} [params.tanggalMulai] - Start date (YYYY-MM-DD), default: first day of next month
 * @param {string} [params.tanggalAkhir] - End date (YYYY-MM-DD), default: last day of next month
 * @param {string} [params.idPegawai] - Specific employee ID (null for all employees)
 * @param {string} [params.mode='skip'] - Mode: 'skip', 'overwrite', or 'error'
 * @param {number} [params.offsetMonth=1] - How many months ahead (1 = next month)
 * @returns {Promise<void>}
 */
export const jalankanGenerateShiftBulanan = async (params = {}) => {
  console.log("📆 Starting generate shift harian bulanan job...");

  // Determine date range
  let tanggalMulai;
  let tanggalAkhir;

  if (params.tanggalMulai && params.tanggalAkhir) {
    tanggalMulai = params.tanggalMulai;
    tanggalAkhir = params.tanggalAkhir;
  } else {
    // Default: next month
    const offsetMonth = params.offsetMonth || 1;
    const now = new Date();

    // First day of target month
    const firstDay = new Date(now.getFullYear(), now.getMonth() + offsetMonth, 1);
    tanggalMulai = firstDay.toISOString().substring(0, 10); // YYYY-MM-DD

    // Last day of target month
    const lastDay = new Date(now.getFullYear(), now.getMonth() + offsetMonth + 1, 0);
    tanggalAkhir = lastDay.toISOString().substring(0, 10); // YYYY-MM-DD
  }

  const mode = params.mode || "skip";
  const idPegawai = params.idPegawai || null;

  console.log(`📅 Generating shifts for period: ${tanggalMulai} to ${tanggalAkhir}`);
  console.log(`👥 Target: ${idPegawai || 'All employees'}`);
  console.log(`🔧 Mode: ${mode}`);

  // Execute generation
  const result = await generateShiftHarianPegawaiService({
    tanggalMulai,
    tanggalAkhir,
    idPegawai,
    mode,
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
