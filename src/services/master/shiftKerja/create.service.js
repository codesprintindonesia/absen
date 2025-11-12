// src/services/master/shiftKerja/create.service.js
import createRepository from '../../../repositories/master/shiftKerja/create.repository.js';
import { generateMasterId, ID_PREFIX } from "../../../utils/idGenerator.util.js";

/**
 * Business logic untuk create shift kerja baru
 * @param {Object} data - Data shift kerja yang akan dibuat
 * @returns {Promise<Object>} Data shift kerja yang baru dibuat
 */
const createService = async (data) => {
  // Generate ID otomatis dengan format SFT-NNN
  const generatedId = generateMasterId(ID_PREFIX.SHIFT_KERJA);

  const newData = {
    ...data,
    id: generatedId, // Auto-generated ID
    is_active: data.is_active !== undefined ? data.is_active : true,
  };
  return await createRepository(newData);
};

export default createService;
