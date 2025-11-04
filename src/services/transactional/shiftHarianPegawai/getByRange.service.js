// src/services/transactional/shiftHarianPegawai/getByRange.service.js

import findByRange from "../../../repositories/transactional/shiftHarianPegawai/findByRange.repository.js";
//import logger from "../../../utils/logger.utils.js";

/**
 * Get shift harian untuk rentang tanggal
 * Support filter by pegawai
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