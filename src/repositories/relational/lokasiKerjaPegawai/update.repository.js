import { LokasiKerjaPegawai } from "../../../models/relational/lokasiKerjaPegawai.model.js";

const updateRepository = async (id, updateData, options = {}) => {
  const [updatedCount, updatedRows] = await LokasiKerjaPegawai.update(updateData, {
    where: { id },
    returning: true,
    ...options,
  });
  if (updatedCount === 0) {
    throw new Error("LOKASI_KERJA_PEGAWAI_NOT_FOUND");
  }
  return updatedRows[0].toJSON();
};

export default updateRepository;
