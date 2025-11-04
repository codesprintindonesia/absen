import {ShiftGroupDetail} from "../../../models/relational/shiftGroupDetail.model.js";

const updateRepository = async (id, updateData, options = {}) => {
  const [updatedCount, updatedRows] = await ShiftGroupDetail.update(updateData, {
    where: { id },
    returning: true,
    ...options,
  });
  if (updatedCount === 0) {
    throw new Error("SHIFT_GROUP_DETAIL_NOT_FOUND");
  }
  return updatedRows[0].toJSON();
};

export default updateRepository;
