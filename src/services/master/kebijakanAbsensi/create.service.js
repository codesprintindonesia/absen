import createRepository from "../../../repositories/master/kebijakanAbsensi/create.repository.js";
/**
 * Business logic untuk create kebijakan absensi
 * @param {Object} data - Data kebijakan absensi baru (sudah tervalidasi oleh Joi middleware)
 * @returns {Promise<Object>} Kebijakan absensi yang dibuat
 */
const createService = async (data) => {
  const policy = await createRepository(data);
  return policy;
};

export default createService;
