import getSequelize from "../../../libraries/databaseInstance.library.js";

// Get sequelize instance
const sequelize = await getSequelize();

/**
 * Repository untuk check apakah lokasi kerja masih digunakan
 * Mengecek foreign key references yang bisa block delete
 * @param {string} lokasiKerjaId - ID lokasi kerja
 * @returns {Object} Status usage dengan detail
 */

const checkUsage = async (lokasiKerjaId, options = {}) => {
  try {
    // Check r_lokasi_kerja_pegawai (ON DELETE RESTRICT - akan error jika ada)
    const [pegawaiLokasiResults] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM absensi.r_lokasi_kerja_pegawai 
      WHERE id_lokasi_kerja = :lokasiKerjaId
    `,
      {
        replacements: { lokasiKerjaId },
        type: sequelize.QueryTypes.SELECT,
        ...options,
      }
    );

    // Check tables yang akan di-set NULL (informational only)
    const [absensiHarianResults] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM absensi.t_absensi_harian 
      WHERE id_lokasi_kerja_digunakan = :lokasiKerjaId
    `,
      {
        replacements: { lokasiKerjaId },
        type: sequelize.QueryTypes.SELECT,
        ...options,
      }
    );

    const [logRawResults] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM absensi.t_log_raw_absensi 
      WHERE id_lokasi_kerja = :lokasiKerjaId
    `,
      {
        replacements: { lokasiKerjaId },
        type: sequelize.QueryTypes.SELECT,
        ...options,
      }
    );

    const [shiftHarianResults] = await sequelize.query(
      `
      SELECT COUNT(*) as count 
      FROM absensi.t_shift_harian_pegawai 
      WHERE id_lokasi_kerja_aktual = :lokasiKerjaId
    `,
      {
        replacements: { lokasiKerjaId },
        type: sequelize.QueryTypes.SELECT,
        ...options,
      }
    );

    const pegawaiCount = parseInt(pegawaiLokasiResults.count);
    const absensiCount = parseInt(absensiHarianResults.count);
    const logRawCount = parseInt(logRawResults.count);
    const shiftCount = parseInt(shiftHarianResults.count);

    return {
      canDelete: pegawaiCount === 0, // Hanya bisa delete jika tidak ada pegawai assigned
      blockingReferences: {
        lokasi_kerja_pegawai: pegawaiCount,
      },
      affectedReferences: {
        absensi_harian: absensiCount,
        log_raw_absensi: logRawCount,
        shift_harian_pegawai: shiftCount,
      },
      totalAffectedRecords: absensiCount + logRawCount + shiftCount,
    };
  } catch (error) {
    throw new Error(`Error checking lokasi kerja usage: ${error.message}`);
  }
};

export default checkUsage;
