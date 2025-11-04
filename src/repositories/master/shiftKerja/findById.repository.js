// src/repositories/master/shiftKerja/findById.repository.js
import { ShiftKerja } from '../../../models/master/shiftKerja.model.js';

const findById = async (id, options = {}) => {
  const record = await ShiftKerja.findByPk(id, options);
  return record ? record.toJSON() : null;
};

export default findById;
