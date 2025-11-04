import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import createRepository from "../../../repositories/relational/shiftPegawai/create.repository.js";
import deactivateOverlapsRepository from "../../../repositories/relational/shiftPegawai/deactivateOverlaps.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const createAutoResolveService = async (data, createdBy = "SYSTEM") => {
  if (!data.id_shift_kerja && !data.id_shift_group) {
    const err = new Error("HARUS_MENGISI_SHIFT_KERJA_ATAU_GROUP");
    err.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw err;
  }
  if (data.id_shift_kerja && data.id_shift_group) {
    const err = new Error("HANYA_SATU_SHIFT_YANG_BOLEH_DIISI");
    err.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw err;
  }

  const sequelize = await getSequelize();
  return await sequelize.transaction(async (trx) => {
    const willBeActive = data.is_active !== false;

    if (willBeActive) {
      await deactivateOverlapsRepository(
        {
          id_pegawai: data.id_pegawai,
          tanggal_mulai: data.tanggal_mulai,
          tanggal_akhir: data.tanggal_akhir ?? null,
          updatedBy: createdBy,
        },
        { transaction: trx }
      );
    }

    const payload = {
      ...data,
      is_active: willBeActive,
      created_by: createdBy,
      updated_by: createdBy,
      updated_at: new Date(),
    };

    const created = await createRepository(payload, { transaction: trx });
    return created;
  });
};

export default createAutoResolveService;
