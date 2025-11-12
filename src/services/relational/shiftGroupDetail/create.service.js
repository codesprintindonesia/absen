import createRepository from "../../../repositories/relational/shiftGroupDetail/create.repository.js";

/**
 * Business logic untuk create shift group detail
 * @param {Object} data - Data shift group detail yang akan dibuat
 * @returns {Promise<Object>} Data shift group detail yang baru dibuat
 */
const createService = async (data) => {
  return await createRepository(data);
};

export default createService;
