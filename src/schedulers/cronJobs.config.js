// ================================================================
// src/schedulers/cronJobs.config.js
// Static configuration untuk semua cron jobs
// ================================================================

import { jalankanRekonsiliasi } from "./jobs/rekonsiliasi.job.js";
import { jalankanGenerateLemburBulanan } from "./jobs/generateLemburBulanan.job.js";
import { jalankanGenerateShiftBulanan } from "./jobs/generateShiftBulanan.job.js";
import { jalankanTestCron } from "./jobs/testCron.job.js";

/**
 * Helper function to check if a cron job is enabled via environment variable
 * Priority: ENV > Default config value
 *
 * @param {string} jobId - Job ID (e.g., "REKONSILIASI_HARIAN")
 * @param {boolean} defaultEnabled - Default enabled value from config
 * @returns {boolean} True if job should be enabled
 */
const isCronJobEnabled = (jobId, defaultEnabled) => {
  // Check global CRON_ENABLED first
  const globalEnabled = process.env.CRON_ENABLED;
  if (globalEnabled === "false" || globalEnabled === "FALSE") {
    return false; // Disable all cron jobs
  }

  // Check specific job ENV variable (format: CRON_JOB_ID_ENABLED)
  const envKey = `CRON_${jobId}_ENABLED`;
  const envValue = process.env[envKey];

  if (envValue !== undefined) {
    return envValue === "true" || envValue === "TRUE";
  }

  // Fallback to default config value
  return defaultEnabled;
};

/**
 * Static cron job configurations
 *
 * Cron Expression Format (6 fields):
 * ┌────────────── second (0-59)
 * │ ┌──────────── minute (0-59)
 * │ │ ┌────────── hour (0-23)
 * │ │ │ ┌──────── day of month (1-31)
 * │ │ │ │ ┌────── month (1-12)
 * │ │ │ │ │ ┌──── day of week (0-7, 0 and 7 are Sunday)
 * │ │ │ │ │ │
 * * * * * * *
 *
 * Examples:
 * - "0 0 2 * * *"        → Every day at 02:00:00
 * - "0 0 1 1 * *"        → 1st day of month at 01:00:00
 * - "0 0 0 1 * *"        → 1st day of month at 00:00:00
 * - "star/10 * * * * *"  → Every 10 seconds (replace "star" with *)
 *
 * Environment Variables:
 * - CRON_ENABLED=true/false → Enable/disable all cron jobs globally
 * - CRON_<JOB_ID>_ENABLED=true/false → Enable/disable specific job
 *
 * Example:
 * - CRON_ENABLED=true
 * - CRON_REKONSILIASI_HARIAN_ENABLED=true
 * - CRON_TEST_CRON_ENABLED=false
 */
export const CRON_JOBS = [
  {
    id: "REKONSILIASI_HARIAN",
    name: "Rekonsiliasi Absensi Harian",
    description: "Rekonsiliasi data absensi untuk hari sebelumnya (H-1)",
    schedule: "0 0 2 * * *", // Every day at 02:00
    enabled: isCronJobEnabled("REKONSILIASI_HARIAN", true),
    executor: jalankanRekonsiliasi,
  },
  {
    id: "GENERATE_LEMBUR_BULANAN",
    name: "Generate Laporan Lembur Bulanan",
    description: "Generate laporan lembur untuk bulan sebelumnya",
    schedule: "0 0 1 1 * *", // 1st day of month at 01:00
    enabled: isCronJobEnabled("GENERATE_LEMBUR_BULANAN", true),
    executor: jalankanGenerateLemburBulanan,
  },
  {
    id: "GENERATE_SHIFT_BULANAN",
    name: "Generate Shift Harian Bulanan",
    description: "Generate jadwal shift untuk bulan depan",
    schedule: "0 0 0 1 * *", // 1st day of month at 00:00
    enabled: isCronJobEnabled("GENERATE_SHIFT_BULANAN", true),
    executor: jalankanGenerateShiftBulanan,
  },
  {
    id: "TEST_CRON",
    name: "Test Cron Job",
    description: "Test cron job untuk development/testing",
    schedule: "*/10 * * * * *", // Every 10 seconds
    enabled: isCronJobEnabled("TEST_CRON", false), // Disabled by default
    executor: jalankanTestCron,
  },
];

/**
 * Get all enabled cron jobs
 * @returns {Array} Array of enabled cron jobs
 */
export const getEnabledCronJobs = () => {
  return CRON_JOBS.filter(job => job.enabled);
};

/**
 * Get cron job by ID
 * @param {string} id - Job ID
 * @returns {Object|undefined} Cron job config
 */
export const getCronJobById = (id) => {
  return CRON_JOBS.find(job => job.id === id);
};
