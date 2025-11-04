// src/controllers/transactional/shiftHarianPegawai/createManual.controller.js
import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import createManualShiftService from '../../../services/transactional/shiftHarianPegawai/createManual.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const createManualController = async (req, res) => {
  try {
    const {
      id_pegawai,
      id_personal,
      nama_pegawai,
      tanggal_mulai,
      tanggal_akhir,
      id_shift_kerja,
      id_lokasi_kerja,
      id_pegawai_pengganti,
      alasan_perubahan,
      overwrite_existing,
    } = req.body;

    const result = await createManualShiftService({
      idPegawai: id_pegawai,
      idPersonal: id_personal,
      namaPegawai: nama_pegawai,
      tanggalMulai: tanggal_mulai,
      tanggalAkhir: tanggal_akhir,
      idShiftKerja: id_shift_kerja,
      idLokasiKerja: id_lokasi_kerja,
      idPegawaiPengganti: id_pegawai_pengganti,
      alasanPerubahan: alasan_perubahan,
      overwriteExisting: overwrite_existing || false,
    });

    return sendResponse(res, {
      code: HTTP_STATUS.CREATED,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return sendResponse(res, {
      code: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default createManualController;