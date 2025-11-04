// src/controllers/transactional/shiftHarianPegawai/updateRange.controller.js

import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import updateRangeShiftService from '../../../services/transactional/shiftHarianPegawai/updateRange.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const updateRangeController = async (req, res) => {
  try {
    const {
      id_pegawai,
      tanggal_mulai,
      tanggal_akhir,
      id_shift_kerja_aktual,
      id_lokasi_kerja_aktual,
      id_pegawai_pengganti,
      nama_pengganti,
      id_personal_pengganti,
      alasan_perubahan,
    } = req.body;

    const result = await updateRangeShiftService({
      idPegawai: id_pegawai,
      tanggalMulai: tanggal_mulai,
      tanggalAkhir: tanggal_akhir,
      updateData: {
        idShiftKerjaAktual: id_shift_kerja_aktual,
        idLokasiKerjaAktual: id_lokasi_kerja_aktual,
        idPegawaiPengganti: id_pegawai_pengganti,
        namaPengganti: nama_pengganti,
        idPersonalPengganti: id_personal_pengganti,
        alasanPerubahan: alasan_perubahan,
      },
    });

    return sendResponse(res, {
      code: HTTP_STATUS.OK,
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

export default updateRangeController;