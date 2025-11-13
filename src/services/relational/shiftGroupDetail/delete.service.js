// ================================================================
// src/services/relational/shiftGroupDetail/delete.service.js
// Service untuk delete shift group detail DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import deleteRepository from "../../../repositories/relational/shiftGroupDetail/delete.repository.js";
import findByIdRepository from "../../../repositories/relational/shiftGroupDetail/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk menghapus shift group detail dengan audit log
 * @param {string} id - ID shift group detail yang akan dihapus
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.deletedBy='SYSTEM'] - Nama user yang menghapus
 * @returns {Promise<Object>} Data shift group detail yang dihapus beserta metadata
 */
const deleteService = async (id, { req, deletedBy = 'SYSTEM' } = {}) => {
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

    // Perform delete
    const deletedCount = await deleteRepository(id, { transaction });
    if (deletedCount === 0) {
      throw new Error("DELETE_FAILED");
    }

    // Log audit DELETE
    await auditLog({
      action: AUDIT_ACTION.DELETE,
      tableName: "relational.r_shift_group_detail",
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
