// src/repositories/master/shiftKerja/findByIdWithHariKerja.repository.js
import { ShiftKerja } from '../../../models/master/shiftKerja.model.js';

const findByIdWithHariKerja = async (id, options = {}) => {
  const record = await ShiftKerja.findByPk(id, {
    attributes: ['id', 'nama', 'hari_kerja', 'jam_masuk', 'jam_pulang'],
    ...options,
  });
  return record ? record.toJSON() : null;
};

export default findByIdWithHariKerja;