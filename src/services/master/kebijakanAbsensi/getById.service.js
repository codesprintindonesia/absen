import findByIdRepository from '../../../repositories/master/kebijakanAbsensi/findById.repository.js';

/**
 * Business logic untuk get kebijakan absensi by ID
 * @param {string} id - ID kebijakan absensi
 * @returns {Promise<Object>} Data kebijakan absensi
 */
const getById = async (id) => {
  const location = await findByIdRepository(id);
  
  if (!location) {
    throw new Error('LOKASI_NOT_FOUND');
  }

  return location;
};

export default getById;  