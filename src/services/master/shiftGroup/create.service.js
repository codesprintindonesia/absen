import createRepository from "../../../repositories/master/shiftGroup/create.repository.js";

/**
 * Business logic untuk create shift group baru
 * @param {Object} data - Data shift group yang akan dibuat
 * @returns {Promise<Object>} Data shift group yang baru dibuat
 */
const createService = async (data) => {
  const shift = await createRepository(data);
  return shift;
};

export default createService;
