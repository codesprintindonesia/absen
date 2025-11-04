import { LogRawAbsensi } from "../../../models/transactional/logRawAbsensi.model.js";

const findByIdRepository = async (id, options = {}) => {
  const row = await LogRawAbsensi.findByPk(id, options);
  return row ? row.toJSON() : null;
};

export default findByIdRepository;
