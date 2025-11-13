// ================================================================
// src/services/master/kebijakanAbsensi/delete.service.js
// Service untuk delete kebijakan absensi DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import deleteRepository from '../../../repositories/master/kebijakanAbsensi/delete.repository.js';
import findByIdRepository from '../../../repositories/master/kebijakanAbsensi/findById.repository.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk menghapus kebijakan absensi (hard delete) dengan audit log
 * @param {string} id - ID kebijakan absensi yang akan dihapus
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.deletedBy='SYSTEM'] - Nama user yang menghapus
 * @returns {Promise<Object>} Data kebijakan yang dihapus beserta metadata
 */
const deleteKebijakanAbsensi = async (id, { req, deletedBy = 'SYSTEM' } = {}) => {
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

    // Perform delete
    const deletedCount = await deleteRepository(id, { transaction });
    if (deletedCount === 0) {
      throw new Error('DELETE_FAILED');
    }

    // Log audit DELETE
    await auditLog({
      action: AUDIT_ACTION.DELETE,
      tableName: "master.m_kebijakan_absensi",
      refId: id,
      beforeData: beforeData,
      afterData: null,
      req,
      transaction,
    });

    await transaction.commit();

    return {
      deleted_policy: existing,
      deleted_by: deletedBy,
      deleted_at: new Date().toISOString(),
    };
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export default deleteKebijakanAbsensi;
