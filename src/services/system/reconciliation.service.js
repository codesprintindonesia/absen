// ================================================================
// 3. src/services/system/reconciliation.service.js
// Service layer sesuai structure project
// ================================================================

import { setupScheduler, jalankanManual, cekStatus } from '../../schedulers/reconciliation.scheduler.js';

const getReconciliationStatus = async () => {
  const status = await cekStatus();
  return {
    status: status,
    next_run: 'Setiap hari jam 02:00 WIB'
  };
};

const runManualReconciliation = async (targetDate) => {
  await jalankanManual(targetDate);
  return {
    message: 'Rekonsiliasi manual dimulai',
    target_date: targetDate || 'kemarin'
  };
};

const initializeReconciliationScheduler = () => {
  setupScheduler();
};

export {
  getReconciliationStatus,
  runManualReconciliation,
  initializeReconciliationScheduler
};