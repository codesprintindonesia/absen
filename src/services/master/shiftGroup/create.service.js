import createRepository from "../../../repositories/master/shiftGroup/create.repository.js";
 

const createService = async (data) => {
  const shift = await createRepository(data);
  return shift;
};

export default createService;
