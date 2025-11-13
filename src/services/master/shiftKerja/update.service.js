// ================================================================
// src/services/master/shiftKerja/update.service.js
// Service untuk update shift kerja DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import updateRepository from '../../../repositories/master/shiftKerja/update.repository.js';
import findByIdRepository from '../../../repositories/master/shiftKerja/findById.repository.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk update shift kerja dengan audit log
 * @param {string} id - ID shift kerja yang akan diupdate
 * @param {Object} updateData - Data yang akan diupdate (sudah tervalidasi)
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.updatedBy='SYSTEM'] - Nama user yang mengupdate
 * @returns {Promise<Object>} Data shift kerja yang sudah diupdate
 */
const updateService = async (id, updateData, { req, updatedBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Business Rule: Check if shift kerja exists
    const existing = await findByIdRepository(id, { transaction });
    if (!existing) {
      const err = new Error('SHIFT_KERJA_NOT_FOUND');
      err.statusCode = HTTP_STATUS.NOT_FOUND;
      throw err;
    }

    // Simpan data lama untuk audit
    const beforeData = existing;

    const dataToUpdate = {
      ...updateData,
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    // Update via repository
    const updatedShift = await updateRepository(id, dataToUpdate, { transaction });

    // Log audit UPDATE
    await auditLog({
      action: AUDIT_ACTION.UPDATE,
      tableName: "master.m_shift_kerja",
      refId: id,
      beforeData: beforeData,
      afterData: updatedShift,
      req,
      transaction,
    });

    await transaction.commit();
    return updatedShift;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export default updateService;
