// ================================================================
// src/services/relational/lokasiKerjaPegawai/delete.service.js
// Service untuk delete lokasi kerja pegawai DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import deleteRepository from "../../../repositories/relational/lokasiKerjaPegawai/delete.repository.js";
import findByIdRepository from "../../../repositories/relational/lokasiKerjaPegawai/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk menghapus lokasi kerja pegawai dengan audit log
 * @param {string} id - ID lokasi kerja pegawai yang akan dihapus
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.deletedBy='SYSTEM'] - Nama user yang menghapus
 * @returns {Promise<Object>} Data lokasi kerja pegawai yang dihapus beserta metadata
 */
const deleteService = async (id, { req, deletedBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Business Rule: Check if data exists
    const existing = await findByIdRepository(id, { transaction });
    if (!existing) {
      const error = new Error("LOKASI_KERJA_PEGAWAI_NOT_FOUND");
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
      tableName: "relational.r_lokasi_kerja_pegawai",
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
