// src/repositories/master/hariLibur/create.repository.js
import { HariLibur } from "../../../models/master/hariLibur.model.js";

/**
 * Repository untuk create hari libur
 * Direct database operation only
 * @param {Object} data - Data hari libur
 * @returns {Object} Hari libur yang dibuat
 */
const create = async (data, options = {}) => {
  const holiday = await HariLibur.create(data, options);
  return holiday.toJSON();
};

export default create;