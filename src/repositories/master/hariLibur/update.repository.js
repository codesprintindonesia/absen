// src/repositories/master/hariLibur/update.repository.js
import { HariLibur } from "../../../models/master/hariLibur.model.js";

/**
 * Repository untuk update hari libur
 * Direct database operation only
 * @param {string} tanggal - Tanggal hari libur (PK)
 * @param {Object} updateData - Data untuk update
 * @returns {Object} Hari libur yang diupdate
 */
const update = async (tanggal, updateData, options = {}) => {
  const [updatedRowsCount, updatedRows] = await HariLibur.update(updateData, {
    where: { tanggal },
    returning: true,
    ...options,
  });
  
  if (updatedRowsCount === 0) {
    throw new Error("Hari libur tidak ditemukan");
  }
  
  return updatedRows[0].toJSON();
};

export default update;