import { LogRawAbsensi } from "../../../models/transactional/logRawAbsensi.model.js";

const createRepository = async (data, options = {}) => {
  const row = await LogRawAbsensi.create(data, options);
  return row.toJSON();
};

export default createRepository;
