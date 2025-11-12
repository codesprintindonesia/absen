import createRepository from "../../../repositories/transactional/logRawAbsensi/create.repository.js";

/**
 * Create new log raw absensi
 * @param {Object} data - Log raw absensi data
 * @param {string} data.id_pegawai - Employee ID
 * @param {string} data.waktu_log - Log timestamp
 * @param {string} data.id_lokasi_kerja - Work location ID
 * @param {string} data.source_absensi - Attendance source
 * @param {string} [data.status_validasi] - Validation status
 * @returns {Promise<Object>} Created log raw absensi record
 */
const createService = async (data) => {
  // validasi bisnis ringan bisa diletakkan di sini bila perlu
  return await createRepository(data);
};

export default createService;
