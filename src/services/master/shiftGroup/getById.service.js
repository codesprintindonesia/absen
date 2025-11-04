import findByIdRepository from '../../../repositories/master/shiftGroup/findById.repository.js';
 
const getById = async (id) => {
  const location = await findByIdRepository(id);
  
  if (!location) {
    throw new Error('LOKASI_NOT_FOUND');
  }

  return location;
};

export default getById;  