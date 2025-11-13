// ================================================================
// src/services/master/shiftGroup/update.service.js
// Service untuk update shift group DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import updateRepository from '../../../repositories/master/shiftGroup/update.repository.js';
import findByIdRepository from '../../../repositories/master/shiftGroup/findById.repository.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk update shift group dengan audit log
 * @param {string} id - ID shift group yang akan diupdate
 * @param {Object} updateData - Data yang akan diupdate (sudah tervalidasi)
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.updatedBy='SYSTEM'] - Nama user yang mengupdate
 * @returns {Promise<Object>} Data shift group yang sudah diupdate
 */
const update = async (id, updateData, { req, updatedBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Business Rule: Check if shift group exists
    const existing = await findByIdRepository(id, { transaction });
    if (!existing) {
      const error = new Error('SHIFT_GROUP_NOT_FOUND');
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
    const updatedShiftGroup = await updateRepository(id, dataToUpdate, { transaction });

    // Log audit UPDATE
    await auditLog({
      action: AUDIT_ACTION.UPDATE,
      tableName: "master.m_shift_group",
      refId: id,
      beforeData: beforeData,
      afterData: updatedShiftGroup,
      req,
      transaction,
    });

    await transaction.commit();
    return updatedShiftGroup;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export default update;
