// src/repositories/laporan/realisasiLembur/update.repository.js

import { RealisasiLembur } from "../../../models/laporan/realisasiLembur.model.js";

const updateRepository = async (id, data, options = {}) => {
  const [affectedRows] = await RealisasiLembur.update(data, {
    where: { id },
    ...options,
  });
  
  if (affectedRows === 0) {
    return null;
  }

  return await RealisasiLembur.findOne({
    where: { id },
    ...options,
  });
};

export default updateRepository;