// ================================================================
// src/utils/audit.util.js
// Utility untuk audit logging - single entry point
// ================================================================

import logInsertService from "../services/system/auditLog/logInsert.service.js";
import logUpdateService from "../services/system/auditLog/logUpdate.service.js";
import logDeleteService from "../services/system/auditLog/logDelete.service.js";
import { nanoid } from "nanoid";

/**
 * Generate unique audit ID
 */
export const generateAuditId = () => {
  const now = new Date();

  // Ambil 2 digit terakhir tahun, lalu bulan dan tanggal
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const dateStr = `${year}${month}${day}`;
  return `AUD-${dateStr}-${nanoid(5)}`;
};

/**
 * Audit action constants
 */
export const AUDIT_ACTION = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
};

/**
 * Extract metadata dari request object
 */
const pickReqMeta = (req = {}) => ({
  actorId: req.user?.id ?? null,
  actorName: req.user?.nama ?? null,
  ipAddress: req.ip ?? null,
  userAgent: req.headers?.["user-agent"] ?? null,
  urlPath: req.originalUrl ?? null,
});

/**
 * Main audit log function
 * Single entry point untuk semua operasi audit
 *
 * @param {Object} params - Audit parameters
 * @param {string} params.action - AUDIT_ACTION.CREATE | UPDATE | DELETE
 * @param {string} params.tableName - Nama tabel
 * @param {string} params.refId - ID record yang di-audit
 * @param {Object} params.beforeData - Data sebelum perubahan (untuk UPDATE/DELETE)
 * @param {Object} params.afterData - Data setelah perubahan (untuk CREATE/UPDATE)
 * @param {Object} params.req - Express request object
 * @param {Object} params.transaction - Sequelize transaction object
 * @param {string} params.reason - Alasan perubahan (optional)
 */
export const auditLog = async ({
  action,
  tableName,
  refId,
  beforeData = null,
  afterData = null,
  req,
  transaction,
  reason = null,
}) => {
  // Extract metadata dari request
  const meta = pickReqMeta(req);

  // Route ke service yang sesuai berdasarkan action
  if (action === AUDIT_ACTION.UPDATE) {
    return await logUpdateService(
      {
        nama_tabel: tableName,
        id_record: refId,
        data_lama: beforeData,
        data_baru: afterData,
        alasan_perubahan: reason,
        req, // Pass full req untuk backward compatibility
      },
      { transaction }
    );
  }

  if (action === AUDIT_ACTION.DELETE) {
    return await logDeleteService(
      {
        nama_tabel: tableName,
        id_record: refId,
        data_lama: beforeData,
        alasan_perubahan: reason,
        req,
      },
      { transaction }
    );
  }

  // Default: CREATE
  return await logInsertService(
    {
      nama_tabel: tableName,
      id_record: refId,
      data_baru: afterData,
      req,
    },
    { transaction }
  );
};
