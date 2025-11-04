// src/repositories/update.repositories.js
import { LokasiKerja } from "../../../models/master/lokasiKerja.model.js";

/**
 * Repository untuk update lokasi kerja
 * Direct database operation only
 * @param {Object} data - Data lokasi kerja
 * @returns {Object} Lokasi kerja yang dibuat
 */
const update = async (id, updateData, options = {}) => {
  const [updatedRowsCount, updatedRows] = await LokasiKerja.update(updateData, {
    where: { id },
    returning: true,
    ...options,
  });
  if (updatedRowsCount === 0) {
    throw new Error("Lokasi kerja tidak ditemukan");
  }
  return updatedRows[0].toJSON();
};

export default update;
