import { ShiftPegawai } from "../../../models/relational/shiftPegawai.model.js";

const findByIdRepository = async (id, options = {}) => {
  const row = await ShiftPegawai.findByPk(id, options);
  return row ? row.toJSON() : null;
};

export default findByIdRepository;
