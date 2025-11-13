import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import createRepository from "../../../repositories/master/lokasiKerja/create.repository.js";
import findByKodeReferensiAndType from "../../../repositories/master/lokasiKerja/findByKodeReferensiAndType.repository.js";
import { generateMasterId, ID_PREFIX } from "../../../utils/idGenerator.util.js";
import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk create lokasi kerja dengan audit log
 * @param {Object} data - Data lokasi kerja baru (sudah tervalidasi oleh Joi middleware)
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @returns {Promise<Object>} Lokasi kerja yang dibuat
 */
const create = async (data, { req } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const { kode_referensi, type_lokasi } = data;

    // Business Rule 1: Check duplicate kode_referensi + type_lokasi
    const existingLocation = await findByKodeReferensiAndType(
      kode_referensi,
      type_lokasi,
      { transaction }
    );
    if (existingLocation) {
      const error = new Error(
        "Kombinasi kode referensi dan type lokasi sudah ada"
      );
      error.statusCode = HTTP_STATUS.CONFLICT; // 409
      throw error;
    }

    // Generate ID otomatis dengan format LOK-NNN
    const generatedId = generateMasterId(ID_PREFIX.LOKASI_KERJA);

    // Transform data dengan business rules
    const locationData = {
      ...data,
      id: generatedId, // Auto-generated ID
      is_active: data.is_active !== undefined ? data.is_active : true,
      radius: data.radius || getDefaultRadius(data.type_lokasi),
    };

    // Simpan ke database via repository
    const newLocation = await createRepository(locationData, { transaction });

    // Log audit INSERT
    await auditLog({
      action: AUDIT_ACTION.CREATE,
      tableName: "master.m_lokasi_kerja",
      refId: newLocation.id,
      beforeData: null,
      afterData: newLocation,
      req,
      transaction,
    });

    await transaction.commit();
    return newLocation;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export { create };
