// ================================================================
// src/services/transactional/absensiHarian/delete.service.js
// Service untuk delete absensi harian DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import deleteRepository from "../../../repositories/transactional/absensiHarian/delete.repository.js";
import findByIdRepository from "../../../repositories/transactional/absensiHarian/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Delete absensi harian dengan audit log
 * PENTING: Service ini untuk HAPUS MANUAL, bukan untuk batch process
 * WARNING: Hard delete - data akan hilang permanen dari database
 *
 * @param {string} id - ID absensi harian yang akan dihapus
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.deletedBy='SYSTEM'] - Nama user yang menghapus (WAJIB untuk audit trail)
 * @returns {Promise<Object>} Data yang dihapus beserta metadata
 * @throws {Error} If record not found (404)
 */
const deleteService = async (id, { req, deletedBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Check if record exists
    const existing = await findByIdRepository(id, { transaction });

    if (!existing) {
      const error = new Error("Data absensi harian tidak ditemukan");
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Business Rule: Cek apakah data sudah final
    if (existing.is_data_final === true) {
      const error = new Error(
        "Data absensi sudah difinalisasi. Tidak dapat dihapus. Hubungi admin untuk membuka kembali data yang sudah final."
      );
      error.statusCode = HTTP_STATUS.FORBIDDEN; // 403
      throw error;
    }

    // Simpan data lama untuk audit
    const beforeData = existing;

    // Perform delete
    const deletedCount = await deleteRepository(id, { transaction });

    if (deletedCount === 0) {
      throw new Error("DELETE_FAILED");
    }

    // Log audit DELETE - CRITICAL untuk tracking manual deletion
    await auditLog({
      action: AUDIT_ACTION.DELETE,
      tableName: "transactional.t_absensi_harian",
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
