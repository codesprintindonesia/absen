import createRepository from "../../../repositories/master/shiftGroup/create.repository.js";
import { generateMasterId, ID_PREFIX } from "../../../utils/idGenerator.util.js";

/**
 * Business logic untuk create shift group baru
 * @param {Object} data - Data shift group yang akan dibuat
 * @returns {Promise<Object>} Data shift group yang baru dibuat
 */
const createService = async (data) => {
  // Generate ID otomatis dengan format SGP-NNN
  const generatedId = generateMasterId(ID_PREFIX.SHIFT_GROUP);

  const shiftData = {
    ...data,
    id: generatedId, // Auto-generated ID
  };

  const shift = await createRepository(shiftData);
  return shift;
};

export default createService;
