import { LokasiKerjaPegawai } from "../../../models/relational/lokasiKerjaPegawai.model.js";

const createRepository = async (data, options = {}) => {
  const row = await LokasiKerjaPegawai.create(data, options);
  return row.toJSON();
};

export default createRepository;
