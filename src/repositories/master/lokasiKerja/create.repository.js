// src/repositories/create.repositories.js
import { LokasiKerja } from "../../../models/master/lokasiKerja.model.js";

/**
 * Repository untuk create lokasi kerja
 * Direct database operation only
 * @param {Object} data - Data lokasi kerja
 * @returns {Object} Lokasi kerja yang dibuat
 */
const create = async (data, options = {}) => {

  const location = await LokasiKerja.create(data, options);
  return location.toJSON();

};

export default create;
