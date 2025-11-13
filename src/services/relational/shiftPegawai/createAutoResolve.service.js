// ================================================================
// src/services/relational/shiftPegawai/createAutoResolve.service.js
// Service untuk create shift pegawai dengan auto-resolve DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import createRepository from "../../../repositories/relational/shiftPegawai/create.repository.js";
import deactivateOverlapsRepository from "../../../repositories/relational/shiftPegawai/deactivateOverlaps.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk create shift pegawai dengan auto-resolve conflict (deactivate overlaps) dan audit log
 * @param {Object} data - Data shift pegawai yang akan dibuat
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.createdBy='SYSTEM'] - Nama user yang membuat
 * @returns {Promise<Object>} Data shift pegawai yang baru dibuat
 */
const createAutoResolveService = async (data, { req, createdBy = 'SYSTEM' } = {}) => {
  if (!data.id_shift_kerja && !data.id_shift_group) {
    const err = new Error("HARUS_MENGISI_SHIFT_KERJA_ATAU_GROUP");
    err.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw err;
  }
  if (data.id_shift_kerja && data.id_shift_group) {
    const err = new Error("HANYA_SATU_SHIFT_YANG_BOLEH_DIISI");
    err.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw err;
  }

  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const willBeActive = data.is_active !== false;

    if (willBeActive) {
      await deactivateOverlapsRepository(
        {
          id_pegawai: data.id_pegawai,
          tanggal_mulai: data.tanggal_mulai,
          tanggal_akhir: data.tanggal_akhir ?? null,
          updatedBy: createdBy,
        },
        { transaction }
      );
    }

    const payload = {
      ...data,
      is_active: willBeActive,
      created_by: createdBy,
      updated_by: createdBy,
      updated_at: new Date(),
    };

    const created = await createRepository(payload, { transaction });

    // Log audit INSERT
    await auditLog({
      action: AUDIT_ACTION.CREATE,
      tableName: "relational.r_shift_pegawai",
      refId: created.id,
      beforeData: null,
      afterData: created,
      req,
      transaction,
    });

    await transaction.commit();
    return created;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export default createAutoResolveService;
