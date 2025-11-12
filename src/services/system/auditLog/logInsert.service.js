// ================================================================
// src/services/system/auditLog/logInsert.service.js
// Service untuk log INSERT operation
// ================================================================

import { nanoid } from "nanoid";
import insertRepository from "../../../repositories/system/auditLog/insert.repository.js"; 
import { generateAuditId } from "../../../utils/audit.util.js";

/**
 * Extract metadata dari request
 * @param {Object} req - Express request object
 * @returns {Object} Extracted metadata
 * @returns {string} metadata.alamat_ip - IP address
 * @returns {string} metadata.user_agent_info - User agent info
 * @returns {string} metadata.id_user_pelaku - User ID
 */
const extractMetadata = (req) => {
  return {
    alamat_ip: req.ip || req.connection?.remoteAddress || null,
    user_agent_info: req.get("user-agent") || null,
    id_user_pelaku: req.user?.id || req.userId || "SYSTEM",
  };
};

/**
 * Log INSERT operation
 * @param {Object} params - Parameters
 * @param {string} params.nama_tabel - Table name
 * @param {string} params.id_record - Record ID
 * @param {Object} params.data_baru - New data object
 * @param {Object} params.req - Express request object
 * @param {Object} [options={}] - Additional options (e.g., transaction)
 * @returns {Promise<Object>} Created audit log record
 * @throws {Error} If required fields are missing
 */
const logInsertService = async (params, options = {}) => {
  const { nama_tabel, id_record, data_baru, req } = params;

  // Validate
  if (!nama_tabel || !id_record || !data_baru) {
    throw new Error("Missing required fields for audit log INSERT");
  }

  // Extract metadata
  const metadata = extractMetadata(req);

  // Build data
  const auditData = {
    id: generateAuditId(),
    nama_tabel,
    id_record,
    jenis_aksi: "INSERT",
    data_lama: null,
    data_baru: JSON.stringify(data_baru),
    ...metadata,
    alasan_perubahan: null,
  };

  // Insert via repository
  return await insertRepository(auditData, options);
};

export default logInsertService;
