// src/repositories/laporan/realisasiLembur/create.repository.js

import { RealisasiLembur } from "../../../models/laporan/realisasiLembur.model.js";

const createRepository = async (data, options = {}) => {
  return await RealisasiLembur.create(data, options);
};

export default createRepository;