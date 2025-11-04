// src/repositories/laporan/realisasiLembur/delete.repository.js

import { RealisasiLembur } from "../../../models/laporan/realisasiLembur.model.js";

const deleteRepository = async (id, options = {}) => {
  const deletedCount = await RealisasiLembur.destroy({
    where: { id },
    ...options,
  });
  
  return deletedCount;
};

export default deleteRepository;