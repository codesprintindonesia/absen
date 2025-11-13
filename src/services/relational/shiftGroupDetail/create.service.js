// ================================================================
// src/services/relational/shiftGroupDetail/create.service.js
// Service untuk create shift group detail DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import createRepository from "../../../repositories/relational/shiftGroupDetail/create.repository.js";
import { generateShiftGroupDetailId } from "../../../utils/idGenerator.util.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk create shift group detail dengan audit log
 * @param {Object} data - Data shift group detail yang akan dibuat
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @returns {Promise<Object>} Data shift group detail yang baru dibuat
 */
const createService = async (data, { req } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Generate ID otomatis dengan format SGD-{id_shift_group}-{id_shift_kerja}-{random}
    const generatedId = generateShiftGroupDetailId(
      data.id_shift_group,
      data.id_shift_kerja
    );

    const detailData = {
      ...data,
      id: generatedId, // Auto-generated context-rich ID
    };

    // Create via repository
    const result = await createRepository(detailData, { transaction });

    // Log audit INSERT
    await auditLog({
      action: AUDIT_ACTION.CREATE,
      tableName: "relational.r_shift_group_detail",
      refId: result.id,
      beforeData: null,
      afterData: result,
      req,
      transaction,
    });

    await transaction.commit();
    return result;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export default createService;
