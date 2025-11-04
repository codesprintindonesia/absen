import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import createRepository from "../../../repositories/master/lokasiKerja/create.repository.js";
import findByKodeReferensiAndType from "../../../repositories/master/lokasiKerja/findByKodeReferensiAndType.repository.js";

/**
 * Business logic untuk create lokasi kerja
 * @param {Object} data - Data lokasi kerja baru (sudah tervalidasi oleh Joi middleware)
 * @returns {Object} Lokasi kerja yang dibuat
 */
const create = async (data) => {
  const { kode_referensi, type_lokasi } = data;
  // Business Rule 1: Check duplicate kode_referensi + type_lokasi
  const existingLocation = await findByKodeReferensiAndType(
    kode_referensi,
    type_lokasi
  );
  if (existingLocation) {
    const error = new Error(
      "Kombinasi kode referensi dan type lokasi sudah ada"
    );
    error.statusCode = HTTP_STATUS.CONFLICT; // 409
    throw error;
  }

  // Transform data dengan business rules
  const locationData = {
    ...data,
    is_active: data.is_active !== undefined ? data.is_active : true,
    radius: data.radius || getDefaultRadius(data.type_lokasi),
  };

  // Simpan ke database via repository
  const newLocation = await createRepository(locationData);

  return newLocation;
};

export { create };
