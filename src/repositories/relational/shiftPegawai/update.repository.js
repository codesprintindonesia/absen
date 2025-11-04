import { ShiftPegawai } from "../../../models/relational/shiftPegawai.model.js";

const updateRepository = async (id, updateData, options = {}) => {
  const [count, rows] = await ShiftPegawai.update(updateData, {
    where: { id },
    returning: true,
    ...options,
  });
  if (count === 0) throw new Error("SHIFT_PEGAWAI_NOT_FOUND");
  return rows[0].toJSON();
};

export default updateRepository;
