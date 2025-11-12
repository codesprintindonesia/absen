import createRepository from "../../../repositories/transactional/logRawAbsensi/create.repository.js";
import { generateLogRawAbsensiId } from "../../../utils/idGenerator.util.js";

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
  // Generate ID otomatis dengan format LOG-{id_pegawai}-{timestamp}
  const waktuLog = new Date(data.waktu_log);
  const generatedId = generateLogRawAbsensiId(data.id_pegawai, waktuLog);

  const logRawAbsensiData = {
    ...data,
    id: generatedId, // Auto-generated ID
  };

  // validasi bisnis ringan bisa diletakkan di sini bila perlu
  return await createRepository(logRawAbsensiData);
};

export default createService;
