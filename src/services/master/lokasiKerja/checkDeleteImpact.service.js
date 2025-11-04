import findByIdRepository from '../../../repositories/master/lokasiKerja/findById.repository.js';
import checkUsageRepository from '../../../repositories/master/lokasiKerja/checkUsage.repository.js';

/**
 * Business logic untuk check dampak delete tanpa melakukan delete
 * Useful untuk konfirmasi sebelum delete
 * @param {string} id - ID lokasi kerja
 * @returns {Object} Impact analysis
 */
const checkDeleteImpact = async (id) => {
  // Check if lokasi kerja exists
  const existingLocation = await findByIdRepository(id);
  if (!existingLocation) {
    throw new Error('LOKASI_NOT_FOUND');
  }

  // Get usage information
  const usageInfo = await checkUsageRepository(id);
  
  return {
    location_info: {
      id: existingLocation.id,
      nama: existingLocation.nama,
      type_lokasi: existingLocation.type_lokasi,
      is_active: existingLocation.is_active
    },
    delete_status: {
      can_delete: usageInfo.canDelete,
      reason: !usageInfo.canDelete ? 
        'Lokasi kerja masih memiliki pegawai yang assigned' : 
        'Lokasi kerja dapat dihapus'
    },
    impact_analysis: {
      blocking_references: usageInfo.blockingReferences,
      affected_references: usageInfo.affectedReferences,
      total_affected_records: usageInfo.totalAffectedRecords,
      consequences: usageInfo.totalAffectedRecords > 0 ? [
        'Data absensi harian akan kehilangan referensi lokasi',
        'Log raw absensi akan kehilangan referensi lokasi', 
        'Data shift harian akan kehilangan referensi lokasi aktual',
        'Data historis tetap tersimpan namun tanpa referensi lokasi'
      ] : [
        'Tidak ada data yang akan terpengaruh'
      ]
    },
    recommendation: !usageInfo.canDelete ? 
      'Gunakan soft delete (set is_active = false) atau pindahkan pegawai ke lokasi lain terlebih dahulu' :
      usageInfo.totalAffectedRecords > 0 ?
        'Pertimbangkan untuk backup data terkait sebelum menghapus' :
        'Aman untuk dihapus'
  };
};

export { checkDeleteImpact };