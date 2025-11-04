// src/controllers/master/hariLibur/create.controller.js
import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import create from '../../../services/master/hariLibur/create.service.js';
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * POST /hari-libur
 * Create hari libur baru
 */
const createController = async (req, res) => {
  try {
    const holiday = await create(req.body, { req });
    
    return sendResponse(res, {
      httpCode: HTTP_STATUS.CREATED, // 201
      message: 'Success',
      data: holiday
    });
  } catch (error) {
    console.log(error); 
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error)
    });
  }
};

export default createController;