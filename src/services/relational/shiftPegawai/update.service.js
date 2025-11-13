// ================================================================
// src/services/relational/shiftPegawai/update.service.js
// Service untuk update shift pegawai DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import updateRepository from "../../../repositories/relational/shiftPegawai/update.repository.js";
import findByIdRepository from "../../../repositories/relational/shiftPegawai/findById.repository.js";
import findOverlapActiveRepository from "../../../repositories/relational/shiftPegawai/findOverlapActive.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk update shift pegawai dengan validasi overlap dan audit log
 * @param {string} id - ID shift pegawai yang akan diupdate
 * @param {Object} updateData - Data yang akan diupdate
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.updatedBy='SYSTEM'] - Nama user yang mengupdate
 * @returns {Promise<Object>} Data shift pegawai yang sudah diupdate
 */
const updateService = async (id, updateData, { req, updatedBy = 'SYSTEM' } = {}) => {
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

    // guard eksklusif jika field terkait disentuh
    if (updateData.id_shift_kerja !== undefined || updateData.id_shift_group !== undefined) {
      const ker = updateData.id_shift_kerja ?? existing.id_shift_kerja;
      const grp = updateData.id_shift_group ?? existing.id_shift_group;

      if (!ker && !grp) {
        const error = new Error("HARUS_MENGISI_SHIFT_KERJA_ATAU_GROUP");
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }
      if (ker && grp) {
        const error = new Error("HANYA_SATU_SHIFT_YANG_BOLEH_DIISI");
        error.statusCode = HTTP_STATUS.BAD_REQUEST;
        throw error;
      }
    }

    // nilai aktual setelah update (untuk validasi overlap)
    const aktual = {
      id_pegawai: updateData.id_pegawai ?? existing.id_pegawai,
      tanggal_mulai: updateData.tanggal_mulai ?? existing.tanggal_mulai,
      tanggal_akhir: (updateData.tanggal_akhir !== undefined ? updateData.tanggal_akhir : existing.tanggal_akhir) ?? null,
      is_active: updateData.is_active !== undefined ? updateData.is_active : existing.is_active,
    };

    if (aktual.is_active === true) {
      const conflict = await findOverlapActiveRepository({
        id_pegawai: aktual.id_pegawai,
        tanggal_mulai: aktual.tanggal_mulai,
        tanggal_akhir: aktual.tanggal_akhir,
        excludeId: id,
      }, { transaction });
      if (conflict) {
        const error = new Error("SHIFT_PEGAWAI_AKTIF_BENTROK_PERIODE");
        error.statusCode = HTTP_STATUS.CONFLICT;
        error.details = { conflict_id: conflict.id };
        throw error;
      }
    }

    const payload = {
      ...updateData,
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    // Update via repository
    const updated = await updateRepository(id, payload, { transaction });

    // Log audit UPDATE
    await auditLog({
      action: AUDIT_ACTION.UPDATE,
      tableName: "relational.r_shift_pegawai",
      refId: id,
      beforeData: beforeData,
      afterData: updated,
      req,
      transaction,
    });

    await transaction.commit();
    return updated;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export default updateService;
