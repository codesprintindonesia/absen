// ================================================================
// src/services/system/auditLog/logDelete.service.js
// Service untuk log DELETE operation
// ================================================================

import { nanoid } from 'nanoid';
import insertRepository from '../../../repositories/system/auditLog/insert.repository.js';
import { generateAuditId } from '../../../utils/audit.util.js';
 
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
    user_agent_info: req.get('user-agent') || null,
    id_user_pelaku: req.user?.id || req.userId || 'SYSTEM',
  };
};

/**
 * Log DELETE operation
 * @param {Object} params - Parameters
 * @param {string} params.nama_tabel - Table name
 * @param {string} params.id_record - Record ID
 * @param {Object} params.data_lama - Old data object
 * @param {string} [params.alasan_perubahan] - Reason for deletion
 * @param {Object} params.req - Express request object
 * @param {Object} [options={}] - Additional options (e.g., transaction)
 * @returns {Promise<Object>} Created audit log record
 * @throws {Error} If required fields are missing
 */
const logDeleteService = async (params, options = {}) => {
  const { nama_tabel, id_record, data_lama, alasan_perubahan, req } = params;

  // Validate
  if (!nama_tabel || !id_record || !data_lama) {
    throw new Error('Missing required fields for audit log DELETE');
  }

  // Extract metadata
  const metadata = extractMetadata(req);

  // Build data
  const auditData = {
    id: generateAuditId(),
    nama_tabel,
    id_record,
    jenis_aksi: 'DELETE',
    data_lama: JSON.stringify(data_lama),
    data_baru: null,
    ...metadata,
    alasan_perubahan: alasan_perubahan || null,
  };

  // Insert via repository
  return await insertRepository(auditData, options);
};

export default logDeleteService;