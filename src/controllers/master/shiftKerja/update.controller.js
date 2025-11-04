// src/controllers/master/shiftKerja/update.controller.js
import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import updateService from '../../../services/master/shiftKerja/update.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const updateController = async (req, res) => {
  try {
    const data = await updateService(req.params.id, req.body);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: 'Shift kerja berhasil diperbarui',
      data,
    });
  } catch (err) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(err),
      message: formatErrorMessage(err),
    });
  }
};

export default updateController;
