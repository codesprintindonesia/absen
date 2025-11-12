import findByIdRepository from "../../../repositories/relational/shiftGroupDetail/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * Business logic untuk get shift group detail by ID
 * @param {string} id - ID shift group detail
 * @returns {Promise<Object>} Data shift group detail
 */
const getById = async (id) => {
  const detail = await findByIdRepository(id);
  if (!detail) {
    const error = new Error("SHIFT_GROUP_DETAIL_NOT_FOUND");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }
  return detail;
};

export default getById;
