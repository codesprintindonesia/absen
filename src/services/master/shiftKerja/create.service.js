// src/services/master/shiftKerja/create.service.js
import createRepository from '../../../repositories/master/shiftKerja/create.repository.js';
 
const createService = async (data) => { 
  const newData = {
    ...data,
    is_active: data.is_active !== undefined ? data.is_active : true, 
  };
  return await createRepository(newData);
};

export default createService;
