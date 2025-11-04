// ================================================================
// src/services/system/auditLog/logUpdate.service.js
// Service untuk log UPDATE operation
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
 * Log UPDATE operation
 */
const logUpdateService = async (params, options = {}) => {
  const { nama_tabel, id_record, data_lama, data_baru, alasan_perubahan, req } = params;

  // Validate
  if (!nama_tabel || !id_record || !data_lama || !data_baru) {
    throw new Error('Missing required fields for audit log UPDATE');
  }

  // Extract metadata
  const metadata = extractMetadata(req);

  // Build data
  const auditData = {
    id: generateAuditId(),
    nama_tabel,
    id_record,
    jenis_aksi: 'UPDATE',
    data_lama: JSON.stringify(data_lama),
    data_baru: JSON.stringify(data_baru),
    ...metadata,
    alasan_perubahan: alasan_perubahan || null,
  };

  // Insert via repository
  return await insertRepository(auditData, options);
};

export default logUpdateService;