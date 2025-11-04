// src/repositories/master/shiftKerja/delete.repository.js
import { ShiftKerja } from '../../../models/master/shiftKerja.model.js';

const deleteById = async (id, options = {}) => {
  const deletedCount = await ShiftKerja.destroy({ where: { id }, ...options });
  return deletedCount;
};

export default deleteById;
