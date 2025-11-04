import createRepository from "../../../repositories/relational/shiftPegawai/create.repository.js";
import findOverlapActiveRepository from "../../../repositories/relational/shiftPegawai/findOverlapActive.repository.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const createService = async (data) => {
  // eksklusif: salah satu wajib diisi
  if (!data.id_shift_kerja && !data.id_shift_group) {
    const error = new Error("HARUS_MENGISI_SHIFT_KERJA_ATAU_GROUP");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw error;
  }
  if (data.id_shift_kerja && data.id_shift_group) {
    const error = new Error("HANYA_SATU_SHIFT_YANG_BOLEH_DIISI");
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw error;
  }

  // cek overlap jika aktif
  const isAktif = typeof data.is_active === "boolean" ? data.is_active : true;
  if (isAktif) {
    const conflict = await findOverlapActiveRepository({
      id_pegawai: data.id_pegawai,
      tanggal_mulai: data.tanggal_mulai,
      tanggal_akhir: data.tanggal_akhir ?? null,
    });
    if (conflict) {
      const error = new Error("SHIFT_PEGAWAI_AKTIF_BENTROK_PERIODE");
      error.statusCode = HTTP_STATUS.CONFLICT;
      error.details = { conflict_id: conflict.id };
      throw error;
    }
  }

  return await createRepository(data);
};

export default createService;
