// src/controllers/transactional/shiftHarianPegawai/generate.controller.js
import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import generateShiftHarianPegawaiService from '../../../services/transactional/shiftHarianPegawai/generate.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const generateShiftHarianPegawaiController = async (req, res) => {
  try {
    const { tanggal_mulai, tanggal_akhir, id_pegawai, mode } = req.body;

    const result = await generateShiftHarianPegawaiService({
      tanggalMulai: tanggal_mulai,
      tanggalAkhir: tanggal_akhir,
      idPegawai: id_pegawai,
      mode: mode || 'skip',
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

export default generateShiftHarianPegawaiController;