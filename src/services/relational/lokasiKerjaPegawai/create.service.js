// ================================================================
// src/services/relational/lokasiKerjaPegawai/create.service.js
// Service untuk create lokasi kerja pegawai DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import createRepository from "../../../repositories/relational/lokasiKerjaPegawai/create.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import { generateLokasiKerjaPegawaiId } from "../../../utils/idGenerator.util.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk create lokasi kerja pegawai dengan audit log
 * @param {Object} data - Data lokasi kerja pegawai yang akan dibuat
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @returns {Promise<Object>} Data lokasi kerja pegawai yang baru dibuat
 */
const createService = async (data, { req } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Generate ID otomatis dengan format LKP-{id_pegawai}-{id_lokasi_kerja}-{random}
    const generatedId = generateLokasiKerjaPegawaiId(
      data.id_pegawai,
      data.id_lokasi_kerja
    );

    const lokasiKerjaPegawaiData = {
      ...data,
      id: generatedId, // Auto-generated context-rich ID
    };

    // Create via repository
    const result = await createRepository(lokasiKerjaPegawaiData, { transaction });

    // Log audit INSERT
    await auditLog({
      action: AUDIT_ACTION.CREATE,
      tableName: "relational.r_lokasi_kerja_pegawai",
      refId: result.id,
      beforeData: null,
      afterData: result,
      req,
      transaction,
    });

    await transaction.commit();
    return result;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export default createService;
