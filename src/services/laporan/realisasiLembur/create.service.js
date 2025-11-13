// ================================================================
// src/services/laporan/realisasiLembur/create.service.js
// Service untuk create realisasi lembur DENGAN AUDIT LOG
// ================================================================

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import createRepository from "../../../repositories/laporan/realisasiLembur/create.repository.js";
import { generateRealisasiLemburId } from "../../../utils/idGenerator.util.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Create new realisasi lembur record dengan audit log
 * @param {Object} data - Realisasi lembur data
 * @param {string} data.id_pegawai - Employee ID
 * @param {Date} data.periode_bulan_lembur - Overtime period month
 * @param {number} data.total_jam_lembur_bulanan - Total monthly overtime hours
 * @param {number} [data.total_hari_terlambat] - Total late days
 * @param {number} [data.total_menit_keterlambatan] - Total late minutes
 * @param {number} [data.total_hari_tidak_hadir] - Total absent days
 * @param {number} [data.total_hari_kerja_efektif] - Total effective work days
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @returns {Promise<Object>} Created realisasi lembur record
 */
const createService = async (data, { req } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    // Generate ID otomatis dengan format LBR-{id_pegawai}-{YYYYMM}
    const periodeBulan = new Date(data.periode_bulan_lembur).toISOString().substring(0, 7); // YYYY-MM
    const generatedId = generateRealisasiLemburId(data.id_pegawai, periodeBulan);

    const realisasiLemburData = {
      ...data,
      id: generatedId, // Auto-generated ID
    };

    // Create via repository
    const result = await createRepository(realisasiLemburData, { transaction });

    // Log audit INSERT
    await auditLog({
      action: AUDIT_ACTION.CREATE,
      tableName: "laporan.l_realisasi_lembur",
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