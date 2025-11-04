import {ShiftGroupDetail} from "../../../models/relational/shiftGroupDetail.model.js";

const deleteRepository = async (id, options = {}) => {
  const deletedCount = await ShiftGroupDetail.destroy({
    where: { id },
    ...options,
  });
  return deletedCount;
};

export default deleteRepository;
