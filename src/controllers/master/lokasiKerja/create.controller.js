// src/controllers/create.controllers.js
import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import { create } from '../../../services/master/lokasiKerja/create.service.js';
import  HTTP_STATUS from "../../../constants/httpStatus.constant.js";
/**
 * POST /lokasi-kerja
 * Create lokasi kerja baru
 */
const createController = async (req, res) => {
  try {
    const newLocation = await create(req.body);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.CREATED, // 201
      message: 'Lokasi kerja berhasil dibuat',
      data: newLocation
    });
  } catch (error) { 
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error) 
    });
  }
};

export default createController;