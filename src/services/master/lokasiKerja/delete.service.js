import deleteRepository from '../../../repositories/master/lokasiKerja/delete.repository.js';
import findByIdRepository from '../../../repositories/master/lokasiKerja/findById.repository.js';
import checkUsageRepository from '../../../repositories/master/lokasiKerja/checkUsage.repository.js';
import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk hard delete lokasi kerja dengan audit log
 * @param {string} id - ID lokasi kerja
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.deletedBy='SYSTEM'] - User ID yang melakukan delete
 * @returns {Promise<Object>} Result delete dengan informasi affected records
 */
const deleteLokasiKerja = async (id, { req, deletedBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();
    // Business Rule 1: Check if lokasi kerja exists
    const existingLocation = await findByIdRepository(id, { transaction });
    if (!existingLocation) {
      throw new Error('LOKASI_NOT_FOUND');
    }

    // Simpan data lama untuk audit
    const beforeData = existingLocation;

    // Business Rule 2: Check usage - hanya informasi, bukan blocking
    // Karena kita ingin memberikan informasi ke user tentang dampak delete
    const usageInfo = await checkUsageRepository(id, { transaction });

    // Business Rule 3: Block delete jika masih ada pegawai assigned
    if (!usageInfo.canDelete) {
      throw new Error('LOKASI_STILL_IN_USE');
    }

    // Business Rule 4: Warning jika ada data yang akan ter-affect
    const hasAffectedData = usageInfo.totalAffectedRecords > 0;

    // Perform hard delete
    const deletedCount = await deleteRepository(id, { transaction });

    if (deletedCount === 0) {
      throw new Error('DELETE_FAILED');
    }

    // Log audit DELETE
    await auditLog({
      action: AUDIT_ACTION.DELETE,
      tableName: "master.m_lokasi_kerja",
      refId: id,
      beforeData: beforeData,
      afterData: null,
      req,
      transaction,
    });

    await transaction.commit();

    return {
      deleted_location: existingLocation,
      deleted_by: deletedBy,
      deleted_at: new Date().toISOString(),
      impact_summary: {
        records_affected: usageInfo.totalAffectedRecords,
        affected_tables: hasAffectedData ? Object.keys(usageInfo.affectedReferences) : [],
        warning: hasAffectedData ?
          'Beberapa record di tabel terkait akan memiliki referensi lokasi kerja = NULL' :
          'Tidak ada data yang terpengaruh'
      }
    };
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export { deleteLokasiKerja };