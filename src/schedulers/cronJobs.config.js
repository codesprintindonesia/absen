// ================================================================
// src/schedulers/cronJobs.config.js
// Static configuration untuk semua cron jobs
// ================================================================

import { jalankanRekonsiliasi } from "./jobs/rekonsiliasi.job.js";
import { jalankanGenerateLemburBulanan } from "./jobs/generateLemburBulanan.job.js";
import { jalankanGenerateShiftBulanan } from "./jobs/generateShiftBulanan.job.js";
import { jalankanTestCron } from "./jobs/testCron.job.js";

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
 * - "0 0 2 * * *"    → Every day at 02:00:00
 * - "0 0 1 1 * *"    → 1st day of month at 01:00:00
 * - "0 0 0 1 * *"    → 1st day of month at 00:00:00
 * - "* /10 * * * * *" → Every 10 seconds (for testing)
 */
export const CRON_JOBS = [
  {
    id: "REKONSILIASI_HARIAN",
    name: "Rekonsiliasi Absensi Harian",
    description: "Rekonsiliasi data absensi untuk hari sebelumnya (H-1)",
    schedule: "0 0 2 * * *", // Every day at 02:00
    enabled: true,
    executor: jalankanRekonsiliasi,
  },
  {
    id: "GENERATE_LEMBUR_BULANAN",
    name: "Generate Laporan Lembur Bulanan",
    description: "Generate laporan lembur untuk bulan sebelumnya",
    schedule: "0 0 1 1 * *", // 1st day of month at 01:00
    enabled: true,
    executor: jalankanGenerateLemburBulanan,
  },
  {
    id: "GENERATE_SHIFT_BULANAN",
    name: "Generate Shift Harian Bulanan",
    description: "Generate jadwal shift untuk bulan depan",
    schedule: "0 0 0 1 * *", // 1st day of month at 00:00
    enabled: true,
    executor: jalankanGenerateShiftBulanan,
  },
  {
    id: "TEST_CRON",
    name: "Test Cron Job",
    description: "Test cron job untuk development/testing",
    schedule: "*/10 * * * * *", // Every 10 seconds
    enabled: false, // Disabled by default
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
