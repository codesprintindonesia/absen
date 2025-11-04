// ================================================================
// src/repositories/system/auditLog/insert.repository.js
// Repository untuk insert audit log
// ================================================================

import { AuditLog } from '../../../models/system/auditLog.model.js';

const insertRepository = async (data, options = {}) => {
  const auditLog = await AuditLog.create(data, options);
  return auditLog.toJSON();
};

export default insertRepository;