// src/services/transactional/shiftHarianPegawai/deleteRange.service.js

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
//import logger from "../../../utils/logger.utils.js";
import deleteByRange from "../../../repositories/transactional/shiftHarianPegawai/deleteByRange.repository.js";
import findByRange from "../../../repositories/transactional/shiftHarianPegawai/findByRange.repository.js";
import { formatDateRange } from "../../../helpers/date.helper.js";

const sequelize = await getSequelize();

/**
 * Delete shift harian untuk rentang tanggal
 * Use case: pembatalan jadwal, error data, dll
 * @param {Object} params - Parameters
 * @param {string} params.idPegawai - Employee ID
 * @param {string} params.tanggalMulai - Start date (YYYY-MM-DD)
 * @param {string} params.tanggalAkhir - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Result with success status and deletion count
 * @returns {Promise<boolean>} result.success - Success status
 * @returns {Promise<string>} result.message - Success message
 * @returns {Promise<Object>} result.data - Deletion data
 * @throws {Error} If no shift data found for the specified range
 */
export const deleteRangeShiftService = async ({
  idPegawai,
  tanggalMulai,
  tanggalAkhir,
}) => {
  const transaction = await sequelize.transaction();

  try {
    // Validate existing data
    const existing = await findByRange(
      { idPegawai, tanggalMulai, tanggalAkhir },
      { transaction }
    );

    if (existing.length === 0) {
      throw new Error(
        `Tidak ada data shift untuk pegawai ${idPegawai} pada rentang ${formatDateRange(tanggalMulai, tanggalAkhir)}`
      );
    }

    // Delete data
    const count = await deleteByRange(
      idPegawai,
      tanggalMulai,
      tanggalAkhir,
      { transaction }
    );

    await transaction.commit();

    logger.info("[DeleteRangeShift] Success", {
      idPegawai,
      totalDeleted: count,
      dateRange: formatDateRange(tanggalMulai, tanggalAkhir),
    });

    return {
      success: true,
      message: "Shift harian berhasil dihapus",
      data: {
        totalDeleted: count,
        dateRange: { tanggalMulai, tanggalAkhir },
      },
    };
  } catch (error) {
    await transaction.rollback();
    logger.error("[DeleteRangeShift] Error", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export default deleteRangeShiftService;