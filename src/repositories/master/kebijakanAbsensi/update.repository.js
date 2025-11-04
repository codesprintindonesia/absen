import { KebijakanAbsensi } from "../../../models/master/kebijakanAbsensi.model.js";

/**
 * Update kebijakan absensi berdasarkan ID.
 * @param {string} id – ID kebijakan yang ingin diupdate
 * @param {Object} updateData – kolom yang akan diupdate
 * @returns {Object} data kebijakan yang telah diperbarui
 */
const update = async (id, updateData, options = {}) => {
  const [updatedCount, updatedRows] = await KebijakanAbsensi.update(updateData, {
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
