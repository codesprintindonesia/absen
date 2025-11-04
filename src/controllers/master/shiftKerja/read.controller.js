// src/controllers/master/shiftKerja/read.controller.js
import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import readService from '../../../services/master/shiftKerja/read.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const readController = async (req, res) => {
  try {
    const data = await readService(req.query);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: 'List shift kerja berhasil didapatkan',
      data,
    });
  } catch (err) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(err),
      message: formatErrorMessage(err),
    });
  }
};

export default readController;
