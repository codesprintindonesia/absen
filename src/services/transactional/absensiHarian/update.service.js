// ================================================================
// src/services/transactional/absensiHarian/update.service.js
// Service untuk update/koreksi absensi harian DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import updateRepository from "../../../repositories/transactional/absensiHarian/update.repository.js";
import findByIdRepository from "../../../repositories/transactional/absensiHarian/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Update/koreksi absensi harian dengan audit log
 * PENTING: Service ini untuk KOREKSI MANUAL, bukan untuk batch rekonsiliasi
 *
 * @param {string} id - ID absensi harian yang akan diupdate
 * @param {Object} updateData - Data yang akan diupdate
 * @param {string} [updateData.jam_masuk_aktual] - Jam masuk aktual (koreksi)
 * @param {string} [updateData.jam_pulang_aktual] - Jam pulang aktual (koreksi)
 * @param {string} [updateData.status_kehadiran] - Status kehadiran (Hadir, Cuti, Izin, Sakit, dll)
 * @param {number} [updateData.menit_keterlambatan] - Menit keterlambatan
 * @param {number} [updateData.menit_pulang_cepat] - Menit pulang cepat
 * @param {number} [updateData.total_jam_kerja_efektif] - Total jam kerja efektif
 * @param {number} [updateData.jam_lembur_dihitung] - Jam lembur yang dihitung
 * @param {string} [updateData.catatan_khusus] - Catatan khusus untuk koreksi
 * @param {boolean} [updateData.is_data_final] - Flag data final
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.updatedBy='SYSTEM'] - Nama user yang mengupdate (WAJIB untuk audit trail)
 * @returns {Promise<Object>} Updated absensi harian data
 * @throws {Error} If record not found (404)
 */
const updateService = async (id, updateData, { req, updatedBy = 'SYSTEM' } = {}) => {
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
        "Data absensi sudah difinalisasi. Hubungi admin untuk membuka kembali data yang sudah final."
      );
      error.statusCode = HTTP_STATUS.FORBIDDEN; // 403
      throw error;
    }

    // Simpan data lama untuk audit
    const beforeData = existing;

    const dataToUpdate = {
      ...updateData,
      updated_at: new Date(),
    };

    // Update via repository
    const updated = await updateRepository(id, dataToUpdate, { transaction });

    // Log audit UPDATE - CRITICAL untuk tracking manual intervention
    await auditLog({
      action: AUDIT_ACTION.UPDATE,
      tableName: "transactional.t_absensi_harian",
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
