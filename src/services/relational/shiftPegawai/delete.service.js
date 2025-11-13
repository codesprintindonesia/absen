// ================================================================
// src/services/relational/shiftPegawai/delete.service.js
// Service untuk delete shift pegawai DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import deleteRepository from "../../../repositories/relational/shiftPegawai/delete.repository.js";
import findByIdRepository from "../../../repositories/relational/shiftPegawai/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk menghapus shift pegawai dengan audit log
 * @param {string} id - ID shift pegawai yang akan dihapus
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.deletedBy='SYSTEM'] - Nama user yang menghapus
 * @returns {Promise<Object>} Data shift pegawai yang dihapus beserta metadata
 */
const deleteService = async (id, { req, deletedBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Check if data exists
    const existing = await findByIdRepository(id, { transaction });
    if (!existing) {
      const error = new Error("SHIFT_PEGAWAI_NOT_FOUND");
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Simpan data lama untuk audit
    const beforeData = existing;

    // Perform delete
    const count = await deleteRepository(id, { transaction });
    if (count === 0) {
      const error = new Error("DELETE_FAILED");
      error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      throw error;
    }

    // Log audit DELETE
    await auditLog({
      action: AUDIT_ACTION.DELETE,
      tableName: "relational.r_shift_pegawai",
      refId: id,
      beforeData: beforeData,
      afterData: null,
      req,
      transaction,
    });

    await transaction.commit();

    return {
      deleted_detail: existing,
      deleted_by: deletedBy,
      deleted_at: new Date().toISOString(),
    };
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export default deleteService;
