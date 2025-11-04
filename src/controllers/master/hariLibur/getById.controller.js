// src/controllers/master/hariLibur/getById.controller.js
import { formatErrorMessage } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import getById from '../../../services/master/hariLibur/getById.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

/**
 * GET /hari-libur/:tanggal
 * Get hari libur by tanggal
 */
const getByIdController = async (req, res) => {
  try {
    const { tanggal } = req.params;
    
    const holiday = await getById(tanggal);
    
    return sendResponse(res, {
      code: HTTP_STATUS.OK, // 200
      message: 'Success',
      data: holiday
    });
  } catch (error) {
    console.log(error);
    const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_ERROR;
    return sendResponse(res, {
      code: statusCode,
      message: formatErrorMessage(error)
    });
  }
};

export default getByIdController;