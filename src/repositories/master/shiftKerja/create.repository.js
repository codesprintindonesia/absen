// src/repositories/master/shiftKerja/create.repository.js
import { ShiftKerja } from '../../../models/master/shiftKerja.model.js';

const create = async (data, options = {}) => {
  const record = await ShiftKerja.create(data, options);
  return record.toJSON();
};

export default create;
