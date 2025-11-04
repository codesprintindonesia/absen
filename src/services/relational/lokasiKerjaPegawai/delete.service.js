import deleteRepository from "../../../repositories/relational/lokasiKerjaPegawai/delete.repository.js";
import findByIdRepository from "../../../repositories/relational/lokasiKerjaPegawai/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const deleteService = async (id, deletedBy = "SYSTEM") => {
  const existing = await findByIdRepository(id);
  if (!existing) {
    const error = new Error("LOKASI_KERJA_PEGAWAI_NOT_FOUND");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  const deletedCount = await deleteRepository(id);
  if (deletedCount === 0) {
    throw new Error("DELETE_FAILED");
  }

  return {
    deleted_detail: existing,
    deleted_by: deletedBy,
    deleted_at: new Date().toISOString(),
  };
};

export default deleteService;
