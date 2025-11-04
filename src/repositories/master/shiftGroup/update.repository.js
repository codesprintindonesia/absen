import shiftGroup from "../../../models/master/shiftGroup.model.js";
 
const update = async (id, updateData, options = {}) => {
  const [updatedCount, updatedRows] = await shiftGroup.update(updateData, {
    where: { id },
    returning: true,
    ...options,
  });
  if (updatedCount === 0) {
    throw new Error("KEBIJAKAN_NOT_FOUND");
  }
  return updatedRows[0].toJSON();
};

export default update;
