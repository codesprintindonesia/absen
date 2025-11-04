import {ShiftGroupDetail} from "../../../models/relational/shiftGroupDetail.model.js";

const createRepository = async (data, options = {}) => {
  const detail = await ShiftGroupDetail.create(data, options);
  return detail.toJSON();
};

export default createRepository;
