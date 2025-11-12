// src/services/transactional/shiftHarianPegawai/generate.service.js
// UNIFIED CYCLE-BASED APPROACH

import { getSequelize } from "../../../libraries/databaseInstance.library.js";
//import logger from "../../../utils/logger.utils.js";

const sequelize = await getSequelize();

/**
 * Generate shift harian untuk pegawai (OLD VERSION - DEPRECATED)
 * UNIFIED APPROACH: Semua pattern menggunakan cycle-based logic
 *
 * @deprecated Use generate.service.js instead
 * @param {Object} params - Parameters
 * @param {string} params.tanggalMulai - Start date (YYYY-MM-DD)
 * @param {string} params.tanggalAkhir - End date (YYYY-MM-DD)
 * @param {string} [params.idPegawai=null] - Specific employee ID (null for all employees)
 * @param {string} [params.mode="error"] - Mode: 'skip', 'overwrite', or 'error'
 * @returns {Promise<Object>} Result with generation summary
 * @returns {Promise<boolean>} result.success - Success status
 * @returns {Promise<string>} result.message - Success message
 * @returns {Promise<Object>} result.data - Generation statistics
 */
export const generateShiftHarianPegawaiService = async ({
  tanggalMulai,
  tanggalAkhir,
  idPegawai = null,
  mode = "error", // ← NEW PARAMETER: 'skip' | 'overwrite' | 'error'
}) => {
  const transaction = await sequelize.transaction();

  // Validate mode
  if (!["skip", "overwrite", "error"].includes(mode)) {
    throw new Error(
      `Invalid mode: ${mode}. Must be 'skip', 'overwrite', or 'error'`
    );
  }

  try {
    logger.info("[ShiftHarianGenerator] Memulai generate shift harian", {
      tanggalMulai,
      tanggalAkhir,
      idPegawai,
      mode,
    });

    // 1. Get daftar pegawai dari r_shift_pegawai
    const shiftPegawaiList = await sequelize.query(
      `SELECT * FROM absensi.r_shift_pegawai WHERE is_active = true ${
        idPegawai ? "AND id_pegawai = :idPegawai" : ""
      }`,
      {
        replacements: { idPegawai },
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    if (shiftPegawaiList.length === 0) {
      throw new Error("Tidak ada pegawai dengan shift assignment aktif");
    }

    // 2. Generate array tanggal
    const tanggalArray = generateDateArray(tanggalMulai, tanggalAkhir);

    const results = {
      totalPegawai: shiftPegawaiList.length,
      totalHari: tanggalArray.length,
      totalGenerated: 0,
      errors: [],
    };

    // 3. Process setiap pegawai
    for (const shiftPegawai of shiftPegawaiList) {
      try {
        await processShiftForPegawai({
          shiftPegawai,
          tanggalArray,
          mode,
          transaction,
        });

        results.totalGenerated += tanggalArray.length;
      } catch (error) {
        logger.error("[ShiftHarianGenerator] Error untuk pegawai", {
          idPegawai: shiftPegawai.id_pegawai,
          error: error.message,
        });

        results.errors.push({
          idPegawai: shiftPegawai.id_pegawai,
          namaPegawai: shiftPegawai.nama_pegawai,
          error: error.message,
        });
      }
    }

    await transaction.commit();

    logger.info(
      "[ShiftHarianGenerator] Selesai generate shift harian",
      results
    );

    return {
      success: true,
      message: "Generate shift harian selesai",
      data: results,
    };
  } catch (error) {
    await transaction.rollback();

    logger.error("[ShiftHarianGenerator] Error generate shift harian", {
      error: error.message,
      stack: error.stack,
    });

    throw error;
  }
};

/**
 * Process shift untuk satu pegawai (internal helper)
 * UNIFIED: Semua pattern (fixed, rotating) menggunakan cycle-based logic
 * @param {Object} params - Parameters
 * @param {Object} params.shiftPegawai - Shift pegawai assignment data
 * @param {Array<string>} params.tanggalArray - Array of dates to process
 * @param {string} params.mode - Processing mode (skip/overwrite/error)
 * @param {Object} params.transaction - Database transaction
 * @returns {Promise<void>}
 */
const processShiftForPegawai = async ({
  shiftPegawai,
  tanggalArray,
  mode,
  transaction,
}) => {
  // Get lokasi kerja dengan prioritas terkecil
  const lokasi = await sequelize.query(
    `SELECT * FROM absensi.r_lokasi_kerja_pegawai 
     WHERE id_pegawai = :idPegawai AND is_active = true 
     ORDER BY prioritas_lokasi ASC LIMIT 1`,
    {
      replacements: { idPegawai: shiftPegawai.id_pegawai },
      type: sequelize.QueryTypes.SELECT,
      transaction,
    }
  );

  if (!lokasi || lokasi.length === 0) {
    throw new Error(
      `Pegawai ${shiftPegawai.id_pegawai} tidak memiliki lokasi kerja aktif`
    );
  }

  const lokasiKerja = lokasi[0];

  // Tentukan tipe shift
  const isFixedShift = shiftPegawai.id_shift_kerja !== null;
  const isRotatingShift = shiftPegawai.id_shift_group !== null;

  if (!isFixedShift && !isRotatingShift) {
    throw new Error(
      `Pegawai ${shiftPegawai.id_pegawai} tidak memiliki shift assignment yang valid`
    );
  }

  let shiftGroupInfo = null;
  let shiftPattern = null;
  let cycleLength = 0;

  if (isRotatingShift) {
    // Get shift group info
    const groupInfo = await sequelize.query(
      `SELECT * FROM absensi.m_shift_group WHERE id = :idShiftGroup`,
      {
        replacements: { idShiftGroup: shiftPegawai.id_shift_group },
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    if (!groupInfo || groupInfo.length === 0) {
      throw new Error(
        `Shift group ${shiftPegawai.id_shift_group} tidak ditemukan`
      );
    }

    shiftGroupInfo = groupInfo[0];

    // Validate: durasi_rotasi_hari harus ada (unified cycle-based)
    if (!shiftGroupInfo.durasi_rotasi_hari) {
      throw new Error(
        `Shift group ${shiftPegawai.id_shift_group} belum di-migrate ke cycle-based. Durasi rotasi hari tidak ditemukan.`
      );
    }

    cycleLength = shiftGroupInfo.durasi_rotasi_hari;

    // Get pattern dari r_shift_group_detail
    shiftPattern = await sequelize.query(
      `SELECT * FROM absensi.r_shift_group_detail 
       WHERE id_shift_group = :idShiftGroup 
       AND urutan_hari_siklus IS NOT NULL
       ORDER BY urutan_hari_siklus`,
      {
        replacements: { idShiftGroup: shiftPegawai.id_shift_group },
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    if (!shiftPattern || shiftPattern.length === 0) {
      throw new Error(
        `Pattern untuk shift group ${shiftPegawai.id_shift_group} tidak ditemukan`
      );
    }

    // Validate: pattern length harus sama dengan cycle length
    if (shiftPattern.length !== cycleLength) {
      throw new Error(
        `Pattern tidak lengkap untuk shift group ${shiftPegawai.id_shift_group}. ` +
          `Expected ${cycleLength} detail, got ${shiftPattern.length}`
      );
    }

    logger.debug("[ShiftHarianGenerator] Shift group info", {
      idPegawai: shiftPegawai.id_pegawai,
      idShiftGroup: shiftPegawai.id_shift_group,
      cycleLength,
      offset: shiftPegawai.offset_rotasi_hari || 0,
    });
  }

  // Get offset untuk rotating shift
  const offset = shiftPegawai.offset_rotasi_hari || 0;

  const results = {
    inserted: 0,
    skipped: 0,
    overwritten: 0,
  };

  // Process setiap tanggal
  for (let dayIndex = 0; dayIndex < tanggalArray.length; dayIndex++) {
    const tanggal = tanggalArray[dayIndex];

    // Check apakah sudah ada
    const existing = await sequelize.query(
      `SELECT id FROM absensi.t_shift_harian_pegawai 
       WHERE id_pegawai = :idPegawai AND tanggal_kerja = :tanggal`,
      {
        replacements: {
          idPegawai: shiftPegawai.id_pegawai,
          tanggal,
        },
        type: sequelize.QueryTypes.SELECT,
        transaction,
      }
    );

    if (existing && existing.length > 0) {
      // ✅ SMART BEHAVIOR
      if (mode === "skip") {
        logger.debug("[ShiftHarianGenerator] Skip existing data", {
          idPegawai: shiftPegawai.id_pegawai,
          tanggal,
        });
        results.skipped++;
        continue;
      } else if (mode === "overwrite") {
        // Delete existing
        await sequelize.query(
          `DELETE FROM absensi.t_shift_harian_pegawai 
           WHERE id_pegawai = :idPegawai AND tanggal_kerja = :tanggal`,
          {
            replacements: { idPegawai: shiftPegawai.id_pegawai, tanggal },
            type: sequelize.QueryTypes.DELETE,
            transaction,
          }
        );

        logger.info("[ShiftHarianGenerator] Overwrite existing data", {
          idPegawai: shiftPegawai.id_pegawai,
          tanggal,
        });
        results.overwritten++;
        // Continue to insert below
      } else if (mode === "error") {
        throw new Error(
          `Data shift untuk pegawai ${shiftPegawai.id_pegawai} ` +
            `tanggal ${tanggal} sudah ada. ` +
            `Gunakan mode='overwrite' untuk menimpa data existing.`
        );
      }
    }

    // Tentukan shift_id
    let shiftId;

    if (isFixedShift) {
      // ✅ FIXED SHIFT: selalu sama
      shiftId = shiftPegawai.id_shift_kerja;
    } else {
      // ✅ ROTATING SHIFT: UNIFIED CYCLE-BASED LOGIC
      // Berlaku untuk semua pattern (6 hari, 21 hari, atau berapa pun)

      // Calculate cycle position dengan offset
      const cyclePosition = ((dayIndex + offset) % cycleLength) + 1;

      // Find pattern by urutan_hari_siklus
      const pattern = shiftPattern.find(
        (p) => p.urutan_hari_siklus === cyclePosition
      );

      if (!pattern || !pattern.id_shift_kerja) {
        throw new Error(
          `Pattern tidak ditemukan untuk hari siklus ${cyclePosition} ` +
            `(dayIndex=${dayIndex}, offset=${offset}, cycleLength=${cycleLength})`
        );
      }

      shiftId = pattern.id_shift_kerja;

      logger.debug("[ShiftHarianGenerator] Cycle calculation", {
        tanggal,
        dayIndex,
        offset,
        cycleLength,
        cyclePosition,
        shiftId,
      });
    }

    // Generate ID
    const dateStr = tanggal.replace(/-/g, "");
    const id = `JDW-${shiftPegawai.id_pegawai}-${dateStr}`;

    // Insert ke t_shift_harian_pegawai
    await sequelize.query(
      `INSERT INTO absensi.t_shift_harian_pegawai (
        id, id_pegawai, tanggal_kerja, 
        id_shift_kerja_jadwal, id_shift_kerja_aktual,
        id_lokasi_kerja_jadwal, id_lokasi_kerja_aktual,
        nama_pegawai, id_personal
      ) VALUES (
        :id, :idPegawai, :tanggalKerja,
        :shiftJadwal, :shiftAktual,
        :lokasiJadwal, :lokasiAktual,
        :namaPegawai, :idPersonal
      )`,
      {
        replacements: {
          id,
          idPegawai: shiftPegawai.id_pegawai,
          tanggalKerja: tanggal,
          shiftJadwal: shiftId,
          shiftAktual: shiftId,
          lokasiJadwal: lokasiKerja.id_lokasi_kerja,
          lokasiAktual: lokasiKerja.id_lokasi_kerja,
          namaPegawai: shiftPegawai.nama_pegawai,
          idPersonal: shiftPegawai.id_personal,
        },
        type: sequelize.QueryTypes.INSERT,
        transaction,
      }
    );
  }

  logger.info("[ShiftHarianGenerator] Selesai untuk pegawai", {
    idPegawai: shiftPegawai.id_pegawai,
    namaPegawai: shiftPegawai.nama_pegawai,
    cycleLength: cycleLength || "FIXED",
    totalDays: tanggalArray.length,
  });
};

/**
 * Generate array tanggal dari start sampai end
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Array<string>} Array of dates in YYYY-MM-DD format
 */
const generateDateArray = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

/**
 * Helper: Calculate optimal offset untuk multiple pegawai
 * @param {number} numPegawai - Number of employees
 * @param {number} cycleLength - Length of shift cycle in days
 * @returns {Array<number>} Array of optimal offset values
 */
export const calculateOptimalOffsets = (numPegawai, cycleLength) => {
  const offsets = [];

  if (cycleLength % numPegawai === 0 || numPegawai % cycleLength === 0) {
    // Perfect distribution
    const step = Math.floor(cycleLength / numPegawai);
    for (let i = 0; i < numPegawai; i++) {
      offsets.push(i * step);
    }
  } else {
    // Sub-optimal but workable
    const step = cycleLength / numPegawai;
    for (let i = 0; i < numPegawai; i++) {
      offsets.push(Math.floor(i * step));
    }
    console.warn(
      `Uneven distribution: ${numPegawai} pegawai with ${cycleLength}-day cycle`
    );
  }

  return offsets;
};

export default generateShiftHarianPegawaiService;
