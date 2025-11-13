// ================================================================
// src/services/master/kebijakanAbsensi/update.service.js
// Service untuk update kebijakan absensi DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import updateRepository from '../../../repositories/master/kebijakanAbsensi/update.repository.js';
import findByIdRepository from '../../../repositories/master/kebijakanAbsensi/findById.repository.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk mengupdate kebijakan absensi dengan audit log
 * @param {string} id - ID kebijakan absensi yang akan diupdate
 * @param {Object} updateData - Data yang akan diupdate (sudah tervalidasi)
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.updatedBy='SYSTEM'] - Nama user yang mengupdate
 * @returns {Promise<Object>} Data kebijakan absensi yang sudah diupdate
 */
const update = async (id, updateData, { req, updatedBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Business Rule: Check if kebijakan absensi exists
    const existing = await findByIdRepository(id, { transaction });
    if (!existing) {
      const error = new Error('KEBIJAKAN_ABSENSI_NOT_FOUND');
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
    const updatedPolicy = await updateRepository(id, dataToUpdate, { transaction });

    // Log audit UPDATE
    await auditLog({
      action: AUDIT_ACTION.UPDATE,
      tableName: "master.m_kebijakan_absensi",
      refId: id,
      beforeData: beforeData,
      afterData: updatedPolicy,
      req,
      transaction,
    });

    await transaction.commit();
    return updatedPolicy;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export default update;
