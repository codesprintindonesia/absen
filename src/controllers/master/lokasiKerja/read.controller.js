// src/controllers/master/lokasiKerja/read.controller.js
import { formatErrorMessage } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import read from '../../../services/master/lokasiKerja/read.service.js';
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * GET /lokasi-kerja
 * Get read lokasi kerja dengan filtering dan pagination
 */
const readController = async (req, res) => {
  try {   

    const result = await read(req.query);
    
    return sendResponse(res, {
      code: HTTP_STATUS.OK, // 200
      message: 'OK',
      data: result.locations,
      metadata: result.metadata
    });
  } catch (error) {
    console.log(error);
    return sendResponse(res, {
      code: HTTP_STATUS.INTERNAL_ERROR, // 500
      message: formatErrorMessage(error)
    });
  }
};

export default readController;