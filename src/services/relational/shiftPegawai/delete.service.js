import deleteRepository from "../../../repositories/relational/shiftPegawai/delete.repository.js";
import findByIdRepository from "../../../repositories/relational/shiftPegawai/findById.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const deleteService = async (id, deletedBy = "SYSTEM") => {
  const existing = await findByIdRepository(id);
  if (!existing) {
    const error = new Error("SHIFT_PEGAWAI_NOT_FOUND");
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    throw error;
  }

  const count = await deleteRepository(id);
  if (count === 0) {
    const error = new Error("DELETE_FAILED");
    error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    throw error;
  }

  return {
    deleted_detail: existing,
    deleted_by: deletedBy,
    deleted_at: new Date().toISOString(),
  };
};

export default deleteService;
