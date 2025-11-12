import createRepository from "../../../repositories/relational/shiftGroupDetail/create.repository.js";
import { generateShiftGroupDetailId } from "../../../utils/idGenerator.util.js";

/**
 * Business logic untuk create shift group detail
 * @param {Object} data - Data shift group detail yang akan dibuat
 * @returns {Promise<Object>} Data shift group detail yang baru dibuat
 */
const createService = async (data) => {
  // Generate ID otomatis dengan format SGD-{9 digits}
  const generatedId = generateShiftGroupDetailId();

  const detailData = {
    ...data,
    id: generatedId, // Auto-generated ID
  };

  return await createRepository(detailData);
};

export default createService;
