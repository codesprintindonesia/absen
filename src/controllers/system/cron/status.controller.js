// src/controllers/system/cron/status.controller.js
import { sendResponse } from "../../../helpers/response.helper.js";
import { formatErrorMessage } from "../../../helpers/error.helper.js";
import { getSchedulerStatus } from "../../../schedulers/centralizedCron.scheduler.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * GET /api/system/cron/status
 * Get current cron scheduler status
 */
const getCronStatusController = async (req, res) => {
  try {
    const status = getSchedulerStatus();

    return sendResponse(res, {
      code: HTTP_STATUS.OK,
      message: "Cron scheduler status retrieved successfully",
      data: status,
    });
  } catch (error) {
    return sendResponse(res, {
      code: HTTP_STATUS.INTERNAL_ERROR,
      message: formatErrorMessage(error),
    });
  }
};

export default getCronStatusController;
