// ================================================================
// src/services/master/shiftKerja/create.service.js
// Service untuk create shift kerja DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import createRepository from '../../../repositories/master/shiftKerja/create.repository.js';
import { generateMasterId, ID_PREFIX } from "../../../utils/idGenerator.util.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk create shift kerja baru dengan audit log
 * @param {Object} data - Data shift kerja yang akan dibuat (sudah tervalidasi)
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @returns {Promise<Object>} Data shift kerja yang baru dibuat
 */
const createService = async (data, { req } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Generate ID otomatis dengan format SFT-NNN
    const generatedId = generateMasterId(ID_PREFIX.SHIFT_KERJA);

    const newData = {
      ...data,
      id: generatedId, // Auto-generated ID
      is_active: data.is_active !== undefined ? data.is_active : true,
    };

    // Create via repository
    const newShift = await createRepository(newData, { transaction });

    // Log audit INSERT
    await auditLog({
      action: AUDIT_ACTION.CREATE,
      tableName: "master.m_shift_kerja",
      refId: newShift.id,
      beforeData: null,
      afterData: newShift,
      req,
      transaction,
    });

    await transaction.commit();
    return newShift;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export default createService;
