import shiftGroup from "../../../models/master/shiftGroup.model.js";
 
const createRepository = async (data, options = {}) => {
  const shift = await shiftGroup.create(data, options);
  return shift.toJSON();
};

export default createRepository;
