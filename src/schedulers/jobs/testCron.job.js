// ================================================================
// src/schedulers/jobs/testCron.job.js
// Job executor untuk testing cron scheduler
// ================================================================

/**
 * Execute test cron job - simple logging untuk verify scheduler
 * Pure logging - no parameters, static behavior
 * @returns {Promise<void>}
 */
export const jalankanTestCron = async () => {
  const timestamp = new Date().toISOString();

  console.log(`\n${"=".repeat(60)}`);
  console.log(`🧪 TEST CRON EXECUTION`);
  console.log(`   Time: ${timestamp}`);
  console.log(`   Status: ✅ Scheduler is working!`);
  console.log(`${"=".repeat(60)}\n`);

  // Simulate some async work
  await new Promise(resolve => setTimeout(resolve, 1000));
};

export default jalankanTestCron;
