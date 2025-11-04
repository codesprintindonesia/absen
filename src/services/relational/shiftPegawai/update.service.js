import updateRepository from "../../../repositories/relational/shiftPegawai/update.repository.js";
import findByIdRepository from "../../../repositories/relational/shiftPegawai/findById.repository.js";
import findOverlapActiveRepository from "../../../repositories/relational/shiftPegawai/findOverlapActive.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const updateService = async (id, updateData, updatedBy = "SYSTEM") => {
  const existing = await findByIdRepository(id);
  if (!existing) {
    const error = new Error("SHIFT_PEGAWAI_NOT_FOUND");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  // guard eksklusif jika field terkait disentuh
  if (updateData.id_shift_kerja !== undefined || updateData.id_shift_group !== undefined) {
    const ker = updateData.id_shift_kerja ?? existing.id_shift_kerja;
    const grp = updateData.id_shift_group ?? existing.id_shift_group;

    if (!ker && !grp) {
      const error = new Error("HARUS_MENGISI_SHIFT_KERJA_ATAU_GROUP");
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }
    if (ker && grp) {
      const error = new Error("HANYA_SATU_SHIFT_YANG_BOLEH_DIISI");
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }
  }

  // nilai aktual setelah update (untuk validasi overlap)
  const aktual = {
    id_pegawai: updateData.id_pegawai ?? existing.id_pegawai,
    tanggal_mulai: updateData.tanggal_mulai ?? existing.tanggal_mulai,
    tanggal_akhir: (updateData.tanggal_akhir !== undefined ? updateData.tanggal_akhir : existing.tanggal_akhir) ?? null,
    is_active: updateData.is_active !== undefined ? updateData.is_active : existing.is_active,
  };

  if (aktual.is_active === true) {
    const conflict = await findOverlapActiveRepository({
      id_pegawai: aktual.id_pegawai,
      tanggal_mulai: aktual.tanggal_mulai,
      tanggal_akhir: aktual.tanggal_akhir,
      excludeId: id,
    });
    if (conflict) {
      const error = new Error("SHIFT_PEGAWAI_AKTIF_BENTROK_PERIODE");
      error.statusCode = HTTP_STATUS.CONFLICT;
      error.details = { conflict_id: conflict.id };
      throw error;
    }
  }

  const payload = {
    ...updateData,
    updated_by: updatedBy,
    updated_at: new Date(),
  };

  return await updateRepository(id, payload);
};

export default updateService;
