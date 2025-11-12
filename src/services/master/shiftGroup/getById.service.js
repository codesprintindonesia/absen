import findByIdRepository from "../../../repositories/master/shiftGroup/findById.repository.js";

/**
 * Business logic untuk get shift group by ID
 * @param {string} id - ID shift group
 * @returns {Promise<Object>} Data shift group
 */
const getById = async (id) => {
  const location = await findByIdRepository(id);

  if (!location) {
    throw new Error("LOKASI_NOT_FOUND");
  }

  return location;
};

export default getById;
