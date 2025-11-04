// ================================================================
// src/controllers/system/auditLog/getHistory.controller.js
// Controller untuk get audit history
// ================================================================

import { sendResponse } from '../../../helpers/response.helper.js';
import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import getHistoryService from '../../../services/system/auditLog/getHistory.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const getHistoryController = async (req, res) => {
  try {
    const { tableName, recordId } = req.params;
    const result = await getHistoryService(tableName, recordId);

    return sendResponse(res, {
      code: HTTP_STATUS.OK,
      message: 'Audit history retrieved successfully',
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

export default getHistoryController;