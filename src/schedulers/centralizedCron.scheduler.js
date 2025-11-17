// ================================================================
// src/schedulers/centralizedCron.scheduler.js
// Pure static cron scheduler - no database dependency
// ================================================================

import cron from "node-cron";
import { CRON_JOBS, getEnabledCronJobs } from "./cronJobs.config.js";

// ================================================================
// SCHEDULER STATE MANAGEMENT
// ================================================================

/**
 * Map untuk menyimpan scheduled tasks
 * Key: job_id, Value: cron.ScheduledTask object
 */
const activeTasks = new Map();

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Validate cron expression (6 field format untuk node-cron)
 * Format: second minute hour day month day-of-week
 * Contoh: "0 0 2 * * *" = setiap hari jam 02:00:00
 * @param {string} cronExpression - Cron expression to validate
 * @returns {boolean} True if valid
 */
const isValidCronExpression = (cronExpression) => {
  return cron.validate(cronExpression);
};

// ================================================================
// CORE SCHEDULER FUNCTIONS
// ================================================================

/**
 * Start a single cron job
 * @param {Object} jobConfig - Job configuration from static config
 * @returns {boolean} True if started successfully
 */
const startCronJob = (jobConfig) => {
  try {
    // Validasi cron expression
    if (!isValidCronExpression(jobConfig.schedule)) {
      console.error(`❌ Invalid cron expression for ${jobConfig.id}: ${jobConfig.schedule}`);
      return false;
    }

    // Validasi executor
    if (!jobConfig.executor || typeof jobConfig.executor !== 'function') {
      console.error(`❌ No executor function for job: ${jobConfig.id}`);
      return false;
    }

    // Cek apakah job sudah running
    if (activeTasks.has(jobConfig.id)) {
      console.log(`⚠️  Job ${jobConfig.id} already running, skipping...`);
      return false;
    }

    // Create scheduled task
    const task = cron.schedule(
      jobConfig.schedule,
      async () => {
        console.log(`\n🎯 [${new Date().toISOString()}] Executing: ${jobConfig.name} (${jobConfig.id})`);

        const startTime = new Date();

        try {
          // Execute job (pure service call, no params)
          await jobConfig.executor();

          const duration = Math.round((new Date() - startTime) / 1000);
          console.log(`✅ [${new Date().toISOString()}] ${jobConfig.name} completed in ${duration}s`);
        } catch (err) {
          console.error(`❌ [${new Date().toISOString()}] ${jobConfig.name} failed:`, err.message);
          console.error(err.stack);
        }
      },
      {
        scheduled: true,
        timezone: "Asia/Makassar",
      }
    );

    // Simpan task ke map
    activeTasks.set(jobConfig.id, task);

    console.log(`✅ Started: ${jobConfig.name} (${jobConfig.id})`);
    console.log(`   Schedule: ${jobConfig.schedule}`);

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
 * Reload all cron jobs from static config
 * Stops all running jobs and starts enabled jobs
 * @returns {Object} Summary of reload operation
 */
const reloadAllCronJobs = () => {
  console.log("\n🔄 Reloading cron jobs from static config...");

  try {
    // Stop all active jobs
    const stoppedCount = activeTasks.size;
    for (const [jobId, task] of activeTasks.entries()) {
      task.stop();
      console.log(`   Stopped: ${jobId}`);
    }
    activeTasks.clear();

    // Get enabled jobs from config
    const enabledJobs = getEnabledCronJobs();

    console.log(`\n📋 Found ${enabledJobs.length} enabled jobs in config`);

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
 * @returns {void}
 */
const initializeCronScheduler = () => {
  console.log("\n🚀 Initializing static cron scheduler...");

  try {
    // Load and start enabled cron jobs from static config
    const result = reloadAllCronJobs();

    console.log("\n✅ Cron scheduler initialized successfully");
    console.log(`   Active jobs: ${result.started_count}`);
    console.log(`   Job IDs: ${result.active_jobs.join(", ")}\n`);
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
    const jobConfig = CRON_JOBS.find(j => j.id === jobId);
    activeJobs.push({
      id: jobId,
      name: jobConfig?.name || 'Unknown',
      schedule: jobConfig?.schedule || 'Unknown',
      is_running: true,
    });
  }

  return {
    active_jobs_count: activeTasks.size,
    active_jobs: activeJobs,
    total_configured_jobs: CRON_JOBS.length,
    enabled_configured_jobs: CRON_JOBS.filter(j => j.enabled).length,
  };
};

// ================================================================
// EXPORTS
// ================================================================

export {
  // Lifecycle
  initializeCronScheduler,
  shutdownCronScheduler,

  // Job Management
  reloadAllCronJobs,
  stopCronJob,

  // Status & Utils
  getSchedulerStatus,
  isValidCronExpression,
};
