// ================================================================
// src/routes/system/auditLog.route.js
// Routes untuk audit log
// ================================================================

import { Router } from 'express';
import readController from '../../controllers/system/auditLog/read.controller.js';
import getHistoryController from '../../controllers/system/auditLog/getHistory.controller.js';

const router = Router();

/**
 * GET /api/v1/system/audit-logs
 * Query params: nama_tabel, id_record, jenis_aksi, id_user_pelaku, start_date, end_date, page, limit
 */
router.get('/', readController);

/**
 * GET /api/v1/system/audit-logs/history/:tableName/:recordId
 */
router.get('/history/:tableName/:recordId', getHistoryController);

export default router;