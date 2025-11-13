import updateRepository from '../../../repositories/master/lokasiKerja/update.repository.js';
import findByIdRepository from '../../../repositories/master/lokasiKerja/findById.repository.js';
import findByKodeReferensiRepository from '../../../repositories/master/lokasiKerja/findByKodeReferensi.repository.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';
import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import { auditLog, AUDIT_ACTION } from "../../../utils/audit.util.js";

/**
 * Business logic untuk update lokasi kerja dengan audit log
 * @param {string} id - ID lokasi kerja
 * @param {Object} updateData - Data untuk diupdate (sudah tervalidasi)
 * @param {Object} [options] - Options object
 * @param {Object} [options.req] - Express request object
 * @param {string} [options.updatedBy='SYSTEM'] - User ID yang melakukan update
 * @returns {Promise<Object>} Data lokasi kerja yang sudah diupdate
 */
const update = async (id, updateData, { req, updatedBy = 'SYSTEM' } = {}) => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    transaction = await sequelize.transaction();
    // Business Rule 1: Check if lokasi kerja exists
    const existingLocation = await findByIdRepository(id, { transaction });
    if (!existingLocation) {
      const error = new Error('LOKASI_NOT_FOUND');
      error.statusCode = HTTP_STATUS.NOT_FOUND; // 404
      throw error;
    }

    // Simpan data lama untuk audit
    const beforeData = existingLocation;

    // Business Rule 2: Check duplicate kode_referensi jika diubah
    if (updateData.kode_referensi && updateData.kode_referensi !== existingLocation.kode_referensi) {
      const duplicateKode = await findByKodeReferensiRepository(updateData.kode_referensi, id, { transaction });
      if (duplicateKode) {
        throw new Error('KODE_REFERENSI_DUPLICATE');
      }
    }

    // Business Rule 3: Validate coordinate consistency
    if (updateData.latitude !== undefined || updateData.longitude !== undefined) {
      const newLatitude = updateData.latitude ?? existingLocation.latitude;
      const newLongitude = updateData.longitude ?? existingLocation.longitude;

      // Both coordinates must be provided or both must be null
      if ((newLatitude && !newLongitude) || (!newLatitude && newLongitude)) {
        throw new Error('COORDINATE_INCOMPLETE');
      }
    }

    // Add audit fields
    const dataToUpdate = {
      ...updateData,
      updated_by: updatedBy,
      updated_at: new Date()
    };

    // Update via repository
    const updatedLocation = await updateRepository(id, dataToUpdate, { transaction });

    // Log audit UPDATE
    await auditLog({
      action: AUDIT_ACTION.UPDATE,
      tableName: "master.m_lokasi_kerja",
      refId: id,
      beforeData: beforeData,
      afterData: updatedLocation,
      req,
      transaction,
    });

    await transaction.commit();
    return updatedLocation;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

export { update };