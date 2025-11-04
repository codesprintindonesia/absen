// ================================================================
// src/controllers/system/auditLog/read.controller.js
// Controller untuk get audit logs
// ================================================================

import { sendResponse } from '../../../helpers/response.helper.js';
import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import readService from '../../../services/system/auditLog/read.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const readController = async (req, res) => {
  try {
    const result = await readService(req.query);

    return sendResponse(res, {
      code: HTTP_STATUS.OK,
      message: 'Audit logs retrieved successfully',
      data: result.items,
      metadata: result.metadata,
    });
  } catch (error) {
    return sendResponse(res, {
      code: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default readController;