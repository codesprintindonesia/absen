// src/repositories/master/shiftKerja/update.repository.js
import { ShiftKerja } from '../../../models/master/shiftKerja.model.js';

const updateRepository = async (id, updateData, options = {}) => {


  const [count, rows] = await ShiftKerja.update(updateData, {
    where: { id },
    returning: true,
    ...options,
  });
  if (count === 0) {
    throw new Error('SHIFT_KERJA_NOT_FOUND');
  }
  return rows[0].toJSON();
};

export default updateRepository;
