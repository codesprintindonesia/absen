// ================================================================
// src/repositories/system/auditLog/findHistory.repository.js
// Repository untuk find audit history by table dan record
// ================================================================

import { AuditLog } from '../../../models/system/auditLog.model.js';

const findHistoryRepository = async (namaTabel, idRecord, options = {}) => {
  const result = await AuditLog.findAll({
    where: {
      nama_tabel: namaTabel,
      id_record: idRecord,
    },
    order: [['created_at', 'DESC']],
    ...options,
  });

  return result.map((row) => row.toJSON());
};

export default findHistoryRepository;