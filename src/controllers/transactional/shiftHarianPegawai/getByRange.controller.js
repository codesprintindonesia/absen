// src/controllers/transactional/shiftHarianPegawai/getByRange.controller.js
import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import getByRangeShiftService from '../../../services/transactional/shiftHarianPegawai/getByRange.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const getByRangeController = async (req, res) => {
  try {
    const { id_pegawai, tanggal_mulai, tanggal_akhir } = req.query;

    const result = await getByRangeShiftService({
      idPegawai: id_pegawai,
      tanggalMulai: tanggal_mulai,
      tanggalAkhir: tanggal_akhir,
    });

    return sendResponse(res, {
      code: HTTP_STATUS.OK,
      message: result.message,
      data: result.data,
      metadata: result.metadata,
    });
  } catch (error) {
    return sendResponse(res, {
      code: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default getByRangeController;