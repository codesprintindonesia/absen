// ================================================================
// src/services/master/hariLibur/update.service.js
// Service untuk update hari libur DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import updateRepository from "../../../repositories/master/hariLibur/update.repository.js";
import findByIdRepository from "../../../repositories/master/hariLibur/findById.repository.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * Business logic untuk update hari libur dengan audit log
 * @param {string} tanggal - Tanggal hari libur (PK)
 * @param {Object} updateData - Data untuk diupdate (sudah tervalidasi)
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @returns {Promise<Object>} Data hari libur yang sudah diupdate
 */
const update = async (tanggal, updateData, { req } = {}) => {
  const sequelize = await getSequelize();

  // Start manual transaction
  const transaction = await sequelize.transaction();

  try {
    // Business Rule: Check if hari libur exists
    const existingHoliday = await findByIdRepository(tanggal, { transaction });
    if (!existingHoliday) {
      const error = new Error("HOLIDAY_NOT_FOUND");
      error.statusCode = HTTP_STATUS.NOT_FOUND; // 404
      throw error;
    }

    // Simpan data lama untuk audit
    const beforeData = existingHoliday;

    // Update via repository
    const updatedHoliday = await updateRepository(tanggal, updateData, {
      transaction,
    });

    // Log audit UPDATE
    await auditLog({
      action: AUDIT_ACTION.UPDATE,
      tableName: "master.m_hari_libur",
      refId: tanggal,
      beforeData: beforeData,
      afterData: updatedHoliday,
      req,
      transaction,
    });

    // Commit transaction jika semua sukses
    await transaction.commit();

    return updatedHoliday;
  } catch (error) {
    // Rollback jika ada error
    await transaction.rollback();
    throw error;
  }
};

export default update;
