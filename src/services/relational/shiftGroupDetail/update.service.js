// ================================================================
// src/services/relational/shiftGroupDetail/update.service.js
// Service untuk update shift group detail DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import updateRepository from "../../../repositories/relational/shiftGroupDetail/update.repository.js";
import findByIdRepository from "../../../repositories/relational/shiftGroupDetail/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk update shift group detail dengan audit log
 * @param {string} id - ID shift group detail yang akan diupdate
 * @param {Object} updateData - Data yang akan diupdate
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.updatedBy='SYSTEM'] - Nama user yang mengupdate
 * @returns {Promise<Object>} Data shift group detail yang sudah diupdate
 */
const updateService = async (id, updateData, { req, updatedBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Check if data exists
    const existing = await findByIdRepository(id, { transaction });
    if (!existing) {
      const error = new Error("SHIFT_GROUP_DETAIL_NOT_FOUND");
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Simpan data lama untuk audit
    const beforeData = existing;

    const dataToUpdate = {
      ...updateData,
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    // Update via repository
    const updated = await updateRepository(id, dataToUpdate, { transaction });

    // Log audit UPDATE
    await auditLog({
      action: AUDIT_ACTION.UPDATE,
      tableName: "relational.r_shift_group_detail",
      refId: id,
      beforeData: beforeData,
      afterData: updated,
      req,
      transaction,
    });

    await transaction.commit();
    return updated;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export default updateService;
