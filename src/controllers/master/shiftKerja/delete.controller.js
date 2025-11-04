// src/controllers/master/shiftKerja/delete.controller.js
import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import deleteService from '../../../services/master/shiftKerja/delete.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const deleteController = async (req, res) => {
  try {
    const data = await deleteService(req.params.id);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: 'Shift kerja berhasil dihapus',
      data,
    });
  } catch (err) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(err),
      message: formatErrorMessage(err),
    });
  }
};

export default deleteController;
