// ================================================================
// src/services/system/auditLog/getHistory.service.js
// Service untuk get audit history
// ================================================================

import findHistoryRepository from '../../../repositories/system/auditLog/findHistory.repository.js';

const getHistoryService = async (namaTabel, idRecord) => {
  const history = await findHistoryRepository(namaTabel, idRecord);

  return {
    items: history,
    metadata: {
      table_name: namaTabel,
      record_id: idRecord,
      total_changes: history.length,
    },
  };
};

export default getHistoryService;