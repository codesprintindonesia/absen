/**
 * Simple Job Scheduler tanpa library external
 * File: src/jobs/scheduler.job.js
 */

// State untuk tracking scheduled jobs
const scheduledJobs = new Map();

/**
 * Parse cron time sederhana (hanya support jam:menit)
 * Format: "HH:MM" (contoh: "02:00")
 */
const parseCronTime = (cronTime) => {
  const [hour, minute] = cronTime.split(":").map(Number);

  if (
    isNaN(hour) ||
    isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error("Invalid cron time format. Use HH:MM (00:00 - 23:59)");
  }

  return { hour, minute };
};

/**
 * Hitung delay sampai waktu eksekusi berikutnya
 */
const calculateNextDelay = (targetHour, targetMinute) => {
  const now = new Date();
  const target = new Date();

  target.setHours(targetHour, targetMinute, 0, 0);

  // Jika target sudah lewat hari ini, set ke besok
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }

  return target - now;
};

/**
 * Schedule job dengan waktu tertentu setiap hari
 */
export const scheduleJob = (jobName, cronTime, jobFunction) => {
  try {
    // Stop job yang sudah ada jika ada
    if (scheduledJobs.has(jobName)) {
      stopJob(jobName);
    }

    const { hour, minute } = parseCronTime(cronTime);

    const runJob = async () => {
      try {
        console.log(`[${new Date().toISOString()}] Running scheduled job: ${jobName}`);
        await jobFunction();
        console.log(`[${new Date().toISOString()}] Completed scheduled job: ${jobName}`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in scheduled job ${jobName}:`, error.message);
      }

      // Schedule next run
      const delay = calculateNextDelay(hour, minute);
      const timeoutId = setTimeout(runJob, delay);

      scheduledJobs.set(jobName, {
        timeoutId,
        cronTime,
        jobFunction,
        nextRun: new Date(Date.now() + delay),
      });

      console.log(
        `[${new Date().toISOString()}] Next run of ${jobName} scheduled at: ${new Date(
          Date.now() + delay
        ).toISOString()}`
      );
    };

    // Calculate initial delay
    const initialDelay = calculateNextDelay(hour, minute);
    const timeoutId = setTimeout(runJob, initialDelay);

    scheduledJobs.set(jobName, {
      timeoutId,
      cronTime,
      jobFunction,
      nextRun: new Date(Date.now() + initialDelay),
    });

    console.log(`[${new Date().toISOString()}] Job ${jobName} scheduled at ${cronTime} (${hour}:${minute})`);
    console.log(
      `[${new Date().toISOString()}] First run will be at: ${new Date(
        Date.now() + initialDelay
      ).toISOString()}`
    );

    return {
      success: true,
      jobName,
      cronTime,
      nextRun: new Date(Date.now() + initialDelay),
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to schedule job ${jobName}:`, error.message);
    throw error;
  }
};

/**
 * Stop scheduled job
 */
export const stopJob = (jobName) => {
  const job = scheduledJobs.get(jobName);

  if (!job) {
    console.warn(`[${new Date().toISOString()}] Job ${jobName} not found`);
    return false;
  }

  clearTimeout(job.timeoutId);
  scheduledJobs.delete(jobName);

  console.log(`[${new Date().toISOString()}] Job ${jobName} stopped`);
  return true;
};

/**
 * Get semua active jobs
 */
export const getActiveJobs = () => {
  const jobs = [];

  scheduledJobs.forEach((job, name) => {
    jobs.push({
      name,
      cronTime: job.cronTime,
      nextRun: job.nextRun,
      status: "ACTIVE",
    });
  });

  return jobs;
};

/**
 * Get job detail by name
 */
export const getJobDetail = (jobName) => {
  const job = scheduledJobs.get(jobName);

  if (!job) {
    return null;
  }

  return {
    name: jobName,
    cronTime: job.cronTime,
    nextRun: job.nextRun,
    status: "ACTIVE",
  };
};

/**
 * Stop all jobs
 */
export const stopAllJobs = () => {
  const jobNames = Array.from(scheduledJobs.keys());

  jobNames.forEach((jobName) => {
    stopJob(jobName);
  });

  console.log(`[${new Date().toISOString()}] All jobs stopped. Total: ${jobNames.length}`);
  return jobNames.length;
};