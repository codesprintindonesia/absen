// src/services/relational/lokasiKerjaPegawai/update.service.js
import updateRepository from "../../../repositories/relational/lokasiKerjaPegawai/update.repository.js";
import findByIdRepository from "../../../repositories/relational/lokasiKerjaPegawai/findById.repository.js";
import readRepository from "../../../repositories/relational/lokasiKerjaPegawai/read.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const updateService = async (id, updateData, updatedBy = "SYSTEM") => {
  // pastikan data ada
  const existing = await findByIdRepository(id);
  if (!existing) {
    const error = new Error("LOKASI_KERJA_PEGAWAI_NOT_FOUND");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  // nilai target setelah update (pakai payload jika ada, fallback ke existing)
  const targetIdPegawai =
    updateData.id_pegawai !== undefined ? updateData.id_pegawai : existing.id_pegawai; 

  const targetIsAktif =
    updateData.is_active !== undefined ? updateData.is_active : existing.is_active; 

  // siapkan payload aktual (gaya kamu: catat updated_by & updated_at)
  const dataToUpdate = {
    ...updateData,
    updated_by: updatedBy,
    updated_at: new Date(),
  };

  const updated = await updateRepository(id, dataToUpdate);
  return updated;
};

export default updateService;
