import { KebijakanAbsensi } from "../../../models/master/kebijakanAbsensi.model.js";
/**
 * Repository untuk create kebijakan absensi
 * Direct database operation only
 * @param {Object} data - Data kebijakan absensi
 * @returns {Object} Kebijakan absensi yang dibuat
 */
const createRepository = async (data, options = {}) => {
  const policy = await KebijakanAbsensi.create(data, options);
  return policy.toJSON();
};

export default createRepository;
