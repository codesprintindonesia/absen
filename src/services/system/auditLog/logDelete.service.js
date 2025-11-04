// ================================================================
// src/services/system/auditLog/logDelete.service.js
// Service untuk log DELETE operation
// ================================================================

import { nanoid } from 'nanoid';
import insertRepository from '../../../repositories/system/auditLog/insert.repository.js';
import { generateAuditId } from '../../../utils/audit.util.js';
 
/**
 * Extract metadata dari request
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