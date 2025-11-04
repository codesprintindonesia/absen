import { LokasiKerja } from "../../../models/master/lokasiKerja.model.js";

/**
 * Cari kebijakan absensi berdasarkan ID.
 */
const findById = async (id, options = {}) => {
  const policy = await LokasiKerja.findByPk(id, options);
  return policy ? policy.toJSON() : null;
};

export default findById;             // ← default export
