import findByIdRepository from '../../../repositories/master/kebijakanAbsensi/findById.repository.js';

/**
 * Business logic untuk get lokasi kerja by ID
 * @param {string} id - ID lokasi kerja
 * @returns {Object} Data lokasi kerja
 */
const getById = async (id) => {
  const location = await findByIdRepository(id);
  
  if (!location) {
    throw new Error('LOKASI_NOT_FOUND');
  }

  return location;
};

export default getById;  