// ================================================================
// 3. src/services/system/reconciliation.service.js
// Service layer sesuai structure project
// ================================================================

import { setupScheduler, jalankanManual, cekStatus } from '../../schedulers/reconciliation.scheduler.js';

/**
 * Get status reconciliation scheduler
 * @returns {Promise<Object>} Status reconciliation dan jadwal berikutnya
 */
const getReconciliationStatus = async () => {
  const status = await cekStatus();
  return {
    status: status,
    next_run: 'Setiap hari jam 02:00 WIB'
  };
};

/**
 * Jalankan reconciliation secara manual
 * @param {string} [targetDate] - Target date untuk reconciliation (optional, default: kemarin)
 * @returns {Promise<Object>} Response message dan target date
 */
const runManualReconciliation = async (targetDate) => {
  await jalankanManual(targetDate);
  return {
    message: 'Rekonsiliasi manual dimulai',
    target_date: targetDate || 'kemarin'
  };
};

/**
 * Initialize reconciliation scheduler (non-async)
 * @returns {void}
 */
const initializeReconciliationScheduler = () => {
  setupScheduler();
};

export {
  getReconciliationStatus,
  runManualReconciliation,
  initializeReconciliationScheduler
};