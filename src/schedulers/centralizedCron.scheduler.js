// ================================================================
// src/schedulers/centralizedCron.scheduler.js
// Centralized cron scheduler dengan dynamic enable/disable dari database
// ================================================================

import cron from "node-cron";
import parser from "cron-parser";
import { getAllCronJobsService, updateLastRunService } from "../services/system/cronJobConfig/manageCronJob.service.js";

// Import job executors
import { jalankanRekonsiliasi } from "./jobs/rekonsiliasi.job.js";
import { jalankanGenerateLemburBulanan } from "./jobs/generateLemburBulanan.job.js";
import { jalankanGenerateShiftBulanan } from "./jobs/generateShiftBulanan.job.js";

// ================================================================
// SCHEDULER STATE MANAGEMENT
// ================================================================

/**
 * Map untuk menyimpan scheduled tasks
 * Key: job_id, Value: cron.ScheduledTask object
 */
const activeTasks = new Map();

/**
 * Map untuk menyimpan job executor functions
 * Key: job_type, Value: async function
 */
const jobExecutors = new Map([
  ["REKONSILIASI_HARIAN", jalankanRekonsiliasi],
  ["GENERATE_LEMBUR_BULANAN", jalankanGenerateLemburBulanan],
  ["GENERATE_SHIFT_BULANAN", jalankanGenerateShiftBulanan],
  // Tambahkan job executors lainnya di sini
]);

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Calculate next run time dari cron expression
 * @param {string} cronExpression - Cron expression
 * @param {string} timezone - Timezone
 * @returns {Date|null} Next run time or null if error
 */
const calculateNextRun = (cronExpression, timezone = "Asia/Makassar") => {
  try {
    const interval = parser.parseExpression(cronExpression, {
      currentDate: new Date(),
      tz: timezone,
    });
    return interval.next().toDate();
  } catch (error) {
    console.error(`Error parsing cron expression "${cronExpression}":`, error.message);
    return null;
  }
};

/**
 * Validate cron expression
 * @param {string} cronExpression - Cron expression to validate
 * @returns {boolean} True if valid
 */
const isValidCronExpression = (cronExpression) => {
  try {
    parser.parseExpression(cronExpression);
    return true;
  } catch (error) {
    return false;
  }
};

// ================================================================
// CORE SCHEDULER FUNCTIONS
// ================================================================

/**
 * Start a single cron job
 * @param {Object} jobConfig - Job configuration from database
 * @returns {boolean} True if started successfully
 */
const startCronJob = (jobConfig) => {
  try {
    // Validasi cron expression
    if (!isValidCronExpression(jobConfig.cron_expression)) {
      console.error(`❌ Invalid cron expression for ${jobConfig.id}: ${jobConfig.cron_expression}`);
      return false;
    }

    // Cek apakah job executor tersedia
    const executor = jobExecutors.get(jobConfig.job_type);
    if (!executor) {
      console.error(`❌ No executor found for job type: ${jobConfig.job_type}`);
      return false;
    }

    // Cek apakah job sudah running
    if (activeTasks.has(jobConfig.id)) {
      console.log(`⚠️  Job ${jobConfig.id} already running, skipping...`);
      return false;
    }

    // Create scheduled task
    const task = cron.schedule(
      jobConfig.cron_expression,
      async () => {
        console.log(`\n🎯 [${new Date().toISOString()}] Executing cron job: ${jobConfig.job_name} (${jobConfig.id})`);

        const startTime = new Date();
        let status = "SUCCESS";
        let error = null;

        try {
          // Execute job dengan config params
          await executor(jobConfig.config_params || {});

          console.log(`✅ [${new Date().toISOString()}] Job ${jobConfig.job_name} completed successfully`);
        } catch (err) {
          status = "FAILED";
          error = err.message;
          console.error(`❌ [${new Date().toISOString()}] Job ${jobConfig.job_name} failed:`, err.message);
        }

        // Update last run info di database
        try {
          const nextRun = calculateNextRun(jobConfig.cron_expression, jobConfig.timezone);

          await updateLastRunService(jobConfig.id, {
            status,
            error,
            nextRun,
          });

          const duration = Math.round((new Date() - startTime) / 1000);
          console.log(`📊 Job execution took ${duration}s. Next run: ${nextRun ? nextRun.toISOString() : 'N/A'}`);
        } catch (updateErr) {
          console.error(`⚠️  Failed to update last run info:`, updateErr.message);
        }
      },
      {
        scheduled: true,
        timezone: jobConfig.timezone || "Asia/Makassar",
      }
    );

    // Simpan task ke map
    activeTasks.set(jobConfig.id, task);

    const nextRun = calculateNextRun(jobConfig.cron_expression, jobConfig.timezone);
    console.log(`✅ Started cron job: ${jobConfig.job_name} (${jobConfig.id})`);
    console.log(`   Schedule: ${jobConfig.cron_expression}`);
    console.log(`   Next run: ${nextRun ? nextRun.toISOString() : 'N/A'}`);

    return true;
  } catch (error) {
    console.error(`❌ Error starting cron job ${jobConfig.id}:`, error.message);
    return false;
  }
};

/**
 * Stop a single cron job
 * @param {string} jobId - Job ID to stop
 * @returns {boolean} True if stopped successfully
 */
const stopCronJob = (jobId) => {
  try {
    const task = activeTasks.get(jobId);

    if (!task) {
      console.log(`⚠️  Job ${jobId} is not running`);
      return false;
    }

    task.stop();
    activeTasks.delete(jobId);

    console.log(`🛑 Stopped cron job: ${jobId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error stopping cron job ${jobId}:`, error.message);
    return false;
  }
};

/**
 * Reload all cron jobs from database
 * Stops all running jobs and starts enabled jobs
 * @returns {Promise<Object>} Summary of reload operation
 */
const reloadAllCronJobs = async () => {
  console.log("\n🔄 Reloading all cron jobs from database...");

  try {
    // Stop all active jobs
    const stoppedCount = activeTasks.size;
    for (const [jobId, task] of activeTasks.entries()) {
      task.stop();
      console.log(`   Stopped: ${jobId}`);
    }
    activeTasks.clear();

    // Get enabled jobs from database
    const enabledJobs = await getAllCronJobsService({ enabledOnly: true });

    console.log(`\n📋 Found ${enabledJobs.length} enabled jobs in database`);

    // Start enabled jobs
    let startedCount = 0;
    let failedCount = 0;

    for (const jobConfig of enabledJobs) {
      const started = startCronJob(jobConfig);
      if (started) {
        startedCount++;
      } else {
        failedCount++;
      }
    }

    console.log(`\n✅ Reload complete!`);
    console.log(`   Stopped: ${stoppedCount} jobs`);
    console.log(`   Started: ${startedCount} jobs`);
    console.log(`   Failed: ${failedCount} jobs`);

    return {
      success: true,
      stopped_count: stoppedCount,
      started_count: startedCount,
      failed_count: failedCount,
      active_jobs: Array.from(activeTasks.keys()),
    };
  } catch (error) {
    console.error("❌ Error reloading cron jobs:", error.message);
    throw error;
  }
};

/**
 * Initialize cron scheduler
 * Called at application startup
 * @returns {Promise<void>}
 */
const initializeCronScheduler = async () => {
  console.log("\n🚀 Initializing centralized cron scheduler...");

  try {
    await reloadAllCronJobs();
    console.log("\n✅ Cron scheduler initialized successfully\n");
  } catch (error) {
    console.error("❌ Failed to initialize cron scheduler:", error.message);
    throw error;
  }
};

/**
 * Shutdown cron scheduler
 * Called at application shutdown
 * @returns {void}
 */
const shutdownCronScheduler = () => {
  console.log("\n🛑 Shutting down cron scheduler...");

  let stoppedCount = 0;
  for (const [jobId, task] of activeTasks.entries()) {
    task.stop();
    console.log(`   Stopped: ${jobId}`);
    stoppedCount++;
  }
  activeTasks.clear();

  console.log(`✅ Cron scheduler shutdown complete. Stopped ${stoppedCount} jobs.\n`);
};

/**
 * Get scheduler status
 * @returns {Object} Current scheduler status
 */
const getSchedulerStatus = () => {
  const activeJobs = [];

  for (const [jobId, task] of activeTasks.entries()) {
    activeJobs.push({
      job_id: jobId,
      is_running: true,
    });
  }

  return {
    active_jobs_count: activeTasks.size,
    active_jobs: activeJobs,
    available_executors: Array.from(jobExecutors.keys()),
  };
};

/**
 * Enable a specific cron job
 * @param {string} jobId - Job ID to enable
 * @returns {Promise<boolean>} True if enabled successfully
 */
const enableCronJob = async (jobId) => {
  try {
    // Get job config from database
    const { getCronJobByIdService } = await import("../services/system/cronJobConfig/manageCronJob.service.js");
    const jobConfig = await getCronJobByIdService(jobId);

    if (!jobConfig.is_enabled) {
      console.error(`❌ Job ${jobId} is not enabled in database`);
      return false;
    }

    // Stop if already running
    if (activeTasks.has(jobId)) {
      stopCronJob(jobId);
    }

    // Start job
    return startCronJob(jobConfig);
  } catch (error) {
    console.error(`❌ Error enabling cron job ${jobId}:`, error.message);
    return false;
  }
};

/**
 * Disable a specific cron job
 * @param {string} jobId - Job ID to disable
 * @returns {boolean} True if disabled successfully
 */
const disableCronJob = (jobId) => {
  return stopCronJob(jobId);
};

// ================================================================
// EXPORTS
// ================================================================

export {
  initializeCronScheduler,
  shutdownCronScheduler,
  reloadAllCronJobs,
  enableCronJob,
  disableCronJob,
  getSchedulerStatus,
  startCronJob,
  stopCronJob,
  calculateNextRun,
  isValidCronExpression,
};
