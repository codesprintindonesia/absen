// ================================================================
// src/services/laporan/realisasiLembur/update.service.js
// Service untuk update realisasi lembur DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import updateRepository from "../../../repositories/laporan/realisasiLembur/update.repository.js";
import getByIdRepository from "../../../repositories/laporan/realisasiLembur/getById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Update realisasi lembur by ID dengan audit log
 * @param {string} id - Realisasi lembur ID
 * @param {Object} data - Data to update
 * @param {number} [data.total_jam_lembur_bulanan] - Total monthly overtime hours
 * @param {number} [data.total_hari_terlambat] - Total late days
 * @param {number} [data.total_menit_keterlambatan] - Total late minutes
 * @param {number} [data.total_hari_tidak_hadir] - Total absent days
 * @param {number} [data.total_hari_kerja_efektif] - Total effective work days
 * @param {boolean} [data.is_data_final] - Is data final
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.updatedBy='SYSTEM'] - Nama user yang mengupdate
 * @returns {Promise<Object>} Updated realisasi lembur record
 * @throws {Error} If record not found (404)
 */
const updateService = async (id, data, { req, updatedBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Check if record exists
    const existing = await getByIdRepository(id, { transaction });

    if (!existing) {
      const error = new Error("Data realisasi lembur tidak ditemukan");
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Simpan data lama untuk audit
    const beforeData = existing;

    const dataToUpdate = {
      ...data,
      updated_at: new Date(),
    };

    // Update via repository
    const updated = await updateRepository(id, dataToUpdate, { transaction });

    // Log audit UPDATE
    await auditLog({
      action: AUDIT_ACTION.UPDATE,
      tableName: "laporan.l_realisasi_lembur",
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