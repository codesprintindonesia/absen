// src/services/transactional/shiftHarianPegawai/createManual.service.js

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
//import logger from "../../../utils/logger.utils.js";
import createBulk from "../../../repositories/transactional/shiftHarianPegawai/createBulk.repository.js";
import deleteByRange from "../../../repositories/transactional/shiftHarianPegawai/deleteByRange.repository.js";
import findShiftKerjaWithHariKerja from "../../../repositories/master/shiftKerja/findByIdWithHariKerja.repository.js";

const sequelize = await getSequelize();

/**
 * Create shift harian manual (untuk override/special case)
 * Support bulk insert untuk rentang tanggal
 */
export const createManualShiftService = async ({
  idPegawai,
  idPersonal,
  namaPegawai,
  tanggalMulai,
  tanggalAkhir,
  idShiftKerja,
  idLokasiKerja,
  idPegawaiPengganti = null,
  alasanPerubahan = null,
  overwriteExisting = false,
}) => {
  const transaction = await sequelize.transaction();

  try {
    // Validate shift exists
    const shiftInfo = await findShiftKerjaWithHariKerja(idShiftKerja, {
      transaction,
    });

    if (!shiftInfo) {
      throw new Error(`Shift ${idShiftKerja} tidak ditemukan`);
    }

    // Generate date array
    const dates = [];
    const current = new Date(tanggalMulai);
    const end = new Date(tanggalAkhir);

    while (current <= end) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    // Delete existing if overwrite
    if (overwriteExisting) {
      const deleted = await deleteByRange(
        idPegawai,
        tanggalMulai,
        tanggalAkhir,
        { transaction }
      );
      logger.info("[CreateManualShift] Deleted existing records", { deleted });
    }

    // Prepare bulk data
    const bulkData = dates.map((tanggal) => {
      const dateStr = tanggal.replace(/-/g, "");
      return {
        id: `JDW-${idPegawai}-${dateStr}`,
        id_pegawai: idPegawai,
        id_personal: idPersonal,
        nama_pegawai: namaPegawai,
        tanggal_kerja: tanggal,
        id_shift_kerja_jadwal: idShiftKerja,
        id_shift_kerja_aktual: idShiftKerja,
        id_lokasi_kerja_jadwal: idLokasiKerja,
        id_lokasi_kerja_aktual: idLokasiKerja,
        id_pegawai_pengganti: idPegawaiPengganti,
        alasan_perubahan: alasanPerubahan,
      };
    });

    const created = await createBulk(bulkData, { transaction });

    await transaction.commit();

    logger.info("[CreateManualShift] Success", {
      idPegawai,
      totalCreated: created.length,
      dateRange: `${tanggalMulai} - ${tanggalAkhir}`,
    });

    return {
      success: true,
      message: "Shift harian berhasil dibuat",
      data: {
        totalCreated: created.length,
        dateRange: { tanggalMulai, tanggalAkhir },
        records: created,
      },
    };
  } catch (error) {
    await transaction.rollback();
    logger.error("[CreateManualShift] Error", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export default createManualShiftService;