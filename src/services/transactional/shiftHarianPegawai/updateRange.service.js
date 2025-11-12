// src/services/transactional/shiftHarianPegawai/updateRange.service.js

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
//import logger from "../../../utils/logger.utils.js";
import updateByRange from "../../../repositories/transactional/shiftHarianPegawai/updateByRange.repository.js";
import findByRange from "../../../repositories/transactional/shiftHarianPegawai/findByRange.repository.js";
import { formatDateRange } from "../../../helpers/date.helper.js";

const sequelize = await getSequelize();

/**
 * Update shift harian untuk rentang tanggal
 * Use case: cuti, izin, tukar shift, perubahan lokasi, dll
 * @param {Object} params - Parameters
 * @param {string} params.idPegawai - Employee ID
 * @param {string} params.tanggalMulai - Start date (YYYY-MM-DD)
 * @param {string} params.tanggalAkhir - End date (YYYY-MM-DD)
 * @param {Object} params.updateData - Data to update
 * @param {string} [params.updateData.idShiftKerjaAktual] - Actual shift ID
 * @param {string} [params.updateData.idLokasiKerjaAktual] - Actual work location ID
 * @param {string} [params.updateData.idPegawaiPengganti] - Substitute employee ID
 * @param {string} [params.updateData.namaPengganti] - Substitute employee name
 * @param {string} [params.updateData.idPersonalPengganti] - Substitute personal ID
 * @param {string} [params.updateData.alasanPerubahan] - Reason for change
 * @returns {Promise<Object>} Result with update count
 * @returns {Promise<boolean>} result.success - Success status
 * @returns {Promise<string>} result.message - Success message
 * @returns {Promise<Object>} result.data - Update data
 * @throws {Error} If no shift data found for the specified range
 */
export const updateRangeShiftService = async ({
  idPegawai,
  tanggalMulai,
  tanggalAkhir,
  updateData,
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

    // Build update payload
    const payload = {};
    
    if (updateData.idShiftKerjaAktual) {
      payload.id_shift_kerja_aktual = updateData.idShiftKerjaAktual;
    }
    
    if (updateData.idLokasiKerjaAktual) {
      payload.id_lokasi_kerja_aktual = updateData.idLokasiKerjaAktual;
    }
    
    if (updateData.idPegawaiPengganti !== undefined) {
      payload.id_pegawai_pengganti = updateData.idPegawaiPengganti;
    }

    if (updateData.namaPengganti !== undefined) {
      payload.nama_pengganti = updateData.namaPengganti;
    }

    if (updateData.idPersonalPengganti !== undefined) {
      payload.id_personal_pengganti = updateData.idPersonalPengganti;
    }
    
    if (updateData.alasanPerubahan !== undefined) {
      payload.alasan_perubahan = updateData.alasanPerubahan;
    }

    if (Object.keys(payload).length === 0) {
      throw new Error("Tidak ada data yang akan diupdate");
    }

    const count = await updateByRange(
      idPegawai,
      tanggalMulai,
      tanggalAkhir,
      payload,
      { transaction }
    );

    await transaction.commit();

    logger.info("[UpdateRangeShift] Success", {
      idPegawai,
      totalUpdated: count,
      dateRange: formatDateRange(tanggalMulai, tanggalAkhir),
      updateData: payload,
    });

    return {
      success: true,
      message: "Shift harian berhasil diupdate",
      data: {
        totalUpdated: count,
        dateRange: { tanggalMulai, tanggalAkhir },
        updatedFields: Object.keys(payload),
      },
    };
  } catch (error) {
    await transaction.rollback();
    logger.error("[UpdateRangeShift] Error", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export default updateRangeShiftService;