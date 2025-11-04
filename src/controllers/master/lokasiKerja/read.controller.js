// src/controllers/master/lokasiKerja/read.controller.js
import { formatErrorMessage } from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import read from "../../../services/master/lokasiKerja/read.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import {
  logProcess,
  logError,
} from "../../../middlewares/requestLogger.middleware.js";

/**
 * GET /lokasi-kerja
 * Get read lokasi kerja dengan filtering dan pagination
 */
const readController = async (req, res) => {
  try {
    logProcess(req, "Start processing read lokasi kerja request", {
      query: req.query,
    });

    const result = await read(req.query);

    logProcess(req, "Controller: Read lokasi kerja completed", {
      totalItems: result.metadata?.total || 0,
    });

    return sendResponse(res, {
      code: HTTP_STATUS.OK, // 200
      message: "OK",
      data: result.locations,
      metadata: result.metadata,
    });
  } catch (error) {
    logError(req, "Controller: Read lokasi kerja failed", error);

    return sendResponse(res, {
      code: HTTP_STATUS.INTERNAL_ERROR, // 500
      message: formatErrorMessage(error),
    });
  }
};

export default readController;
