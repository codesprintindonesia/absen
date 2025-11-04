import createRepository from "../../../repositories/master/kebijakanAbsensi/create.repository.js";
/**
 * Business logic untuk create kebijakan denda
 * @param {Object} data - Data kebijakan denda baru (sudah tervalidasi oleh Joi middleware)
 * @returns {Object} Kebijakan denda yang dibuat
 */

const createService = async (data) => {
  const policy = await createRepository(data);
  return policy;
};

export default createService;
