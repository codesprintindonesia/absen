import { LokasiKerjaPegawai } from "../../../models/relational/lokasiKerjaPegawai.model.js";

const findById = async (id, options = {}) => {
  const row = await LokasiKerjaPegawai.findByPk(id, options);
  return row ? row.toJSON() : null;
};

export default findById;
