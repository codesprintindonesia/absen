import { LokasiKerja } from "../../../models/master/lokasiKerja.model.js";

/**
 * Repository untuk hard delete lokasi kerja
 * Direct database operation only
 * @param {string} id - ID lokasi kerja
 * @returns {number} Jumlah record yang dihapus
 */
const deleteById = async (id, options = {}) => {
  const deletedCount = await LokasiKerja.destroy({
    where: { id },
    ...options,
  });

  return deletedCount;
};

export default deleteById;
