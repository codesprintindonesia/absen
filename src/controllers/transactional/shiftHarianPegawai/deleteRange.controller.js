// src/controllers/transactional/shiftHarianPegawai/deleteRange.controller.js
import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import deleteRangeShiftService from '../../../services/transactional/shiftHarianPegawai/deleteRange.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const deleteRangeController = async (req, res) => {
  try {
    const { id_pegawai, tanggal_mulai, tanggal_akhir, alasan_hapus } = req.body;

    const result = await deleteRangeShiftService({
      idPegawai: id_pegawai,
      tanggalMulai: tanggal_mulai,
      tanggalAkhir: tanggal_akhir,
      alasanHapus: alasan_hapus,
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

export default deleteRangeController;