// ================================================================
// src/services/master/shiftGroup/create.service.js
// Service untuk create shift group DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import createRepository from "../../../repositories/master/shiftGroup/create.repository.js";
import { generateMasterId, ID_PREFIX } from "../../../utils/idGenerator.util.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk create shift group baru dengan audit log
 * @param {Object} data - Data shift group yang akan dibuat (sudah tervalidasi)
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @returns {Promise<Object>} Data shift group yang baru dibuat
 */
const createService = async (data, { req } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Generate ID otomatis dengan format SGP-NNN
    const generatedId = generateMasterId(ID_PREFIX.SHIFT_GROUP);

    const shiftData = {
      ...data,
      id: generatedId, // Auto-generated ID
    };

    // Create via repository
    const shift = await createRepository(shiftData, { transaction });

    // Log audit INSERT
    await auditLog({
      action: AUDIT_ACTION.CREATE,
      tableName: "master.m_shift_group",
      refId: shift.id,
      beforeData: null,
      afterData: shift,
      req,
      transaction,
    });

    await transaction.commit();
    return shift;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export default createService;
