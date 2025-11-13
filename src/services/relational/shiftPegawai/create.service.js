// ================================================================
// src/services/relational/shiftPegawai/create.service.js
// Service untuk create shift pegawai DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import createRepository from "../../../repositories/relational/shiftPegawai/create.repository.js";
import findOverlapActiveRepository from "../../../repositories/relational/shiftPegawai/findOverlapActive.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import { generateShiftPegawaiId } from "../../../utils/idGenerator.util.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk create shift pegawai dengan validasi overlap dan audit log
 * @param {Object} data - Data shift pegawai yang akan dibuat
 * @param {string} data.id_pegawai - ID pegawai
 * @param {string} [data.id_shift_kerja] - ID shift kerja (eksklusif dengan id_shift_group)
 * @param {string} [data.id_shift_group] - ID shift group (eksklusif dengan id_shift_kerja)
 * @param {string} data.tanggal_mulai - Tanggal mulai berlaku
 * @param {string} [data.tanggal_akhir] - Tanggal akhir berlaku
 * @param {boolean} [data.is_active] - Status aktif
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @returns {Promise<Object>} Data shift pegawai yang baru dibuat
 */
const createService = async (data, { req } = {}) => {
  // eksklusif: salah satu wajib diisi
  if (!data.id_shift_kerja && !data.id_shift_group) {
    const error = new Error("HARUS_MENGISI_SHIFT_KERJA_ATAU_GROUP");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw error;
  }
  if (data.id_shift_kerja && data.id_shift_group) {
    const error = new Error("HANYA_SATU_SHIFT_YANG_BOLEH_DIISI");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw error;
  }

  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // cek overlap jika aktif
    const isAktif = typeof data.is_active === "boolean" ? data.is_active : true;
    if (isAktif) {
      const conflict = await findOverlapActiveRepository({
        id_pegawai: data.id_pegawai,
        tanggal_mulai: data.tanggal_mulai,
        tanggal_akhir: data.tanggal_akhir ?? null,
      }, { transaction });
      if (conflict) {
        const error = new Error("SHIFT_PEGAWAI_AKTIF_BENTROK_PERIODE");
        error.statusCode = HTTP_STATUS.CONFLICT;
        error.details = { conflict_id: conflict.id };
        throw error;
      }
    }

    // Generate ID otomatis dengan format SHP-{id_pegawai}-{id_shift}-{random}
    // Use whichever shift ID is provided (kerja or group)
    const idShiftOrGroup = data.id_shift_kerja || data.id_shift_group;
    const generatedId = generateShiftPegawaiId(data.id_pegawai, idShiftOrGroup);

    const shiftPegawaiData = {
      ...data,
      id: generatedId, // Auto-generated context-rich ID
    };

    // Create via repository
    const result = await createRepository(shiftPegawaiData, { transaction });

    // Log audit INSERT
    await auditLog({
      action: AUDIT_ACTION.CREATE,
      tableName: "relational.r_shift_pegawai",
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
