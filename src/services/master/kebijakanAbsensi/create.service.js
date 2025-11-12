import createRepository from "../../../repositories/master/kebijakanAbsensi/create.repository.js";
import { generateMasterId, ID_PREFIX } from "../../../utils/idGenerator.util.js";

/**
 * Business logic untuk create kebijakan absensi
 * @param {Object} data - Data kebijakan absensi baru (sudah tervalidasi oleh Joi middleware)
 * @returns {Promise<Object>} Kebijakan absensi yang dibuat
 */
const createService = async (data) => {
  // Generate ID otomatis dengan format KEB-NNN
  const generatedId = generateMasterId(ID_PREFIX.KEBIJAKAN_ABSENSI);

  const policyData = {
    ...data,
    id: generatedId, // Auto-generated ID
  };

  const policy = await createRepository(policyData);
  return policy;
};

export default createService;
