// src/controllers/master/shiftKerja/getById.controller.js
import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import getByIdService from '../../../services/master/shiftKerja/getById.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const getByIdController = async (req, res) => {
  try {
    const data = await getByIdService(req.params.id);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: 'Detail shift kerja berhasil didapatkan',
      data,
    });
  } catch (err) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(err),
      message: formatErrorMessage(err),
    });
  }
};

export default getByIdController;
