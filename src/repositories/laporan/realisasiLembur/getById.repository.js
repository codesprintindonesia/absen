// src/repositories/laporan/realisasiLembur/getById.repository.js

import { RealisasiLembur } from "../../../models/laporan/realisasiLembur.model.js";

const getByIdRepository = async (id, options = {}) => {
  return await RealisasiLembur.findOne({
    where: { id },
    ...options,
  });
};

export default getByIdRepository;