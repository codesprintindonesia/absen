import createRepository from "../../../repositories/relational/shiftGroupDetail/create.repository.js";

const createService = async (data) => {
  return await createRepository(data);
};

export default createService;
