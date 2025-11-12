// src/services/transactional/shiftHarianPegawai/getByRange.service.js

import findByRange from "../../../repositories/transactional/shiftHarianPegawai/findByRange.repository.js";
import logger from "../../../libraries/logger.library.js";

/**
 * Get shift harian untuk rentang tanggal
 * Support filter by pegawai
 * @param {Object} params - Parameters
 * @param {string} [params.idPegawai=null] - Employee ID (null for all employees)
 * @param {string} params.tanggalMulai - Start date (YYYY-MM-DD)
 * @param {string} params.tanggalAkhir - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Result with shift harian records
 * @returns {Promise<boolean>} result.success - Success status
 * @returns {Promise<string>} result.message - Success message
 * @returns {Promise<Object>} result.data - Shift harian records
 */
export const getByRangeShiftService = async ({
  idPegawai = null,
  tanggalMulai,
  tanggalAkhir,
}) => {
  try {
    const records = await findByRange({
      idPegawai,
      tanggalMulai,
      tanggalAkhir,
    });

    logger.info("[GetByRangeShift] Success", {
      idPegawai,
      totalRecords: records.length,
      dateRange: `${tanggalMulai} - ${tanggalAkhir}`,
    });

    return {
      success: true,
      message: "Data shift harian berhasil diambil",
      data: {
        totalRecords: records.length,
        dateRange: { tanggalMulai, tanggalAkhir },
        records,
      },
    };
  } catch (error) {
    logger.error("[GetByRangeShift] Error", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export default getByRangeShiftService;