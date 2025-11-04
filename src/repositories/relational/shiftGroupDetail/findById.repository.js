import {ShiftGroupDetail} from "../../../models/relational/shiftGroupDetail.model.js";

const findById = async (id, options = {}) => {
  const detail = await ShiftGroupDetail.findByPk(id, options);
  return detail ? detail.toJSON() : null;
};

export default findById;
