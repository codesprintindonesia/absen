import { KebijakanAbsensi } from "../../../models/master/kebijakanAbsensi.model.js";

/**
 * Cari kebijakan absensi berdasarkan ID.
 * Mengembalikan data atau null jika tidak ditemukan.
 */
const findById = async (id, options = {}) => {
  const policy = await KebijakanAbsensi.findByPk(id, options);
  return policy ? policy.toJSON() : null;
};

export default findById;
