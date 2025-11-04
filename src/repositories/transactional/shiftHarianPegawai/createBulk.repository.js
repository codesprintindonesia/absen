// src/repositories/transactional/shiftHarianPegawai/createBulk.repository.js
import { ShiftHarianPegawai } from '../../../models/transactional/shiftHarianPegawai.model.js';

const createBulk = async (dataArray, options = {}) => {
  const records = await ShiftHarianPegawai.bulkCreate(dataArray, {
    validate: true,
    ...options,
  });
  return records.map(r => r.toJSON());
};

export default createBulk;