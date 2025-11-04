import deleteRepository from '../../../repositories/master/lokasiKerja/delete.repository.js';
import findByIdRepository from '../../../repositories/master/lokasiKerja/findById.repository.js';
import checkUsageRepository from '../../../repositories/master/lokasiKerja/checkUsage.repository.js';

/**
 * Business logic untuk hard delete lokasi kerja
 * @param {string} id - ID lokasi kerja
 * @param {string} deletedBy - User ID yang melakukan delete
 * @returns {Object} Result delete dengan informasi affected records
 */
const deleteLokasiKerja = async (id, deletedBy = 'SYSTEM') => {
  // Business Rule 1: Check if lokasi kerja exists
  const existingLocation = await findByIdRepository(id);
  if (!existingLocation) {
    throw new Error('LOKASI_NOT_FOUND');
  }

  // Business Rule 2: Check usage - hanya informasi, bukan blocking
  // Karena kita ingin memberikan informasi ke user tentang dampak delete
  const usageInfo = await checkUsageRepository(id);
  
  // Business Rule 3: Block delete jika masih ada pegawai assigned
  if (!usageInfo.canDelete) {
    throw new Error('LOKASI_STILL_IN_USE');
  }

  // Business Rule 4: Warning jika ada data yang akan ter-affect
  const hasAffectedData = usageInfo.totalAffectedRecords > 0;
  
  // Perform hard delete
  const deletedCount = await deleteRepository(id);
  
  if (deletedCount === 0) {
    throw new Error('DELETE_FAILED');
  }

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
};

export { deleteLokasiKerja };