import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import updateRepository from "../../../repositories/relational/shiftPegawai/update.repository.js";
import findByIdRepository from "../../../repositories/relational/shiftPegawai/findById.repository.js";
import deactivateOverlapsRepository from "../../../repositories/relational/shiftPegawai/deactivateOverlaps.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const updateAutoResolveService = async (id, updateData, updatedBy = "SYSTEM") => {
  const existing = await findByIdRepository(id);
  if (!existing) {
    const err = new Error("SHIFT_PEGAWAI_NOT_FOUND");
    err.statusCode = HTTP_STATUS.NOT_FOUND;
    throw err;
  }

  if (updateData.id_shift_kerja !== undefined || updateData.id_shift_group !== undefined) {
    const ker = updateData.id_shift_kerja ?? existing.id_shift_kerja;
    const grp = updateData.id_shift_group ?? existing.id_shift_group;
    if (!ker && !grp) {
      const err = new Error("HARUS_MENGISI_SHIFT_KERJA_ATAU_GROUP");
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }
    if (ker && grp) {
      const err = new Error("HANYA_SATU_SHIFT_YANG_BOLEH_DIISI");
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw err;
    }
  }

  const aktual = {
    id_pegawai: updateData.id_pegawai ?? existing.id_pegawai,
    tanggal_mulai: updateData.tanggal_mulai ?? existing.tanggal_mulai,
    tanggal_akhir: (updateData.tanggal_akhir !== undefined ? updateData.tanggal_akhir : existing.tanggal_akhir) ?? null,
    is_active: updateData.is_active !== undefined ? updateData.is_active : existing.is_active,
  };

  const sequelize = await getSequelize();
  return await sequelize.transaction(async (trx) => {
    if (aktual.is_active === true) {
      await deactivateOverlapsRepository(
        {
          id_pegawai: aktual.id_pegawai,
          tanggal_mulai: aktual.tanggal_mulai,
          tanggal_akhir: aktual.tanggal_akhir,
          excludeId: id,
          updatedBy,
        },
        { transaction: trx }
      );
    }

    const payload = {
      ...updateData,
      updated_by: updatedBy,
      updated_at: new Date(),
    };

    const updated = await updateRepository(id, payload, { transaction: trx });
    return updated;
  });
};

export default updateAutoResolveService;
