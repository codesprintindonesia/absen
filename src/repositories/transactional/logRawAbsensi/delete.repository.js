import { LogRawAbsensi } from "../../../models/transactional/logRawAbsensi.model.js";

const deleteRepository = async (id, options = {}) => {
  return await LogRawAbsensi.destroy({ where: { id }, ...options });
};

export default deleteRepository;
