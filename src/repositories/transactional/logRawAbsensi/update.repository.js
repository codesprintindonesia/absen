import { LogRawAbsensi } from "../../../models/transactional/logRawAbsensi.model.js";

const updateRepository = async (id, updateData, options = {}) => {
  const [count, rows] = await LogRawAbsensi.update(updateData, {
    where: { id },
    returning: true,
    ...options,
  });
  if (count === 0) throw new Error("LOG_RAW_ABSENSI_NOT_FOUND");
  return rows[0].toJSON();
};

export default updateRepository;
