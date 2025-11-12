// ================================================================
// src/services/master/hariLibur/create.service.js
// Service untuk create hari libur DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import createRepository from "../../../repositories/master/hariLibur/create.repository.js";
import findByIdRepository from "../../../repositories/master/hariLibur/findById.repository.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * Business logic untuk create hari libur dengan audit log
 * @param {Object} data - Data hari libur (sudah tervalidasi)
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @returns {Promise<Object>} Data hari libur yang dibuat
 */
const create = async (data, { req } = {}) => {
  const sequelize = await getSequelize();

  // Start manual transaction
  const transaction = await sequelize.transaction();

  try {
    // Business Rule: Check duplicate tanggal
    const existingHoliday = await findByIdRepository(data.tanggal, {
      transaction,
    });
    if (existingHoliday) {
      const error = new Error("TANGGAL_ALREADY_EXISTS");
      error.statusCode = HTTP_STATUS.CONFLICT; // 409
      throw error;
    }

    // Create hari libur via repository
    const holiday = await createRepository(data, { transaction });

    console.log(holiday);

    // Log audit INSERT
    await auditLog({
      action: AUDIT_ACTION.CREATE,
      tableName: "master.m_hari_libur",
      refId: holiday.tanggal,
      beforeData: null,
      afterData: holiday,
      req,
      transaction,
    });

    // Commit transaction jika semua sukses
    await transaction.commit();

    return holiday;
  } catch (error) {
    // Rollback jika ada error
    await transaction.rollback();
    throw error;
  }
};

export default create;
