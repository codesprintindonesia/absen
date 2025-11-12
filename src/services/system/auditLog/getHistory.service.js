// ================================================================
// src/services/system/auditLog/getHistory.service.js
// Service untuk get audit history
// ================================================================

import findHistoryRepository from '../../../repositories/system/auditLog/findHistory.repository.js';

/**
 * Get audit history for a specific record
 * @param {string} namaTabel - Table name
 * @param {string} idRecord - Record ID
 * @returns {Promise<Object>} Result with audit history
 * @returns {Promise<Array>} result.items - Array of audit log records
 * @returns {Promise<Object>} result.metadata - Metadata with table name and record ID
 */
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