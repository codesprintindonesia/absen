// src/controllers/master/shiftKerja/create.controller.js
import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import createService from '../../../services/master/shiftKerja/create.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const createController = async (req, res) => {
  try {
    const data = await createService(req.body);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.CREATED,
      message: 'Shift kerja berhasil dibuat',
      data,
    });
  } catch (err) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(err),
      message: formatErrorMessage(err),
    });
  }
};

export default createController;
