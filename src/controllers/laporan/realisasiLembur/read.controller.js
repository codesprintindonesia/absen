// src/controllers/laporan/realisasiLembur/read.controller.js

import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import readService from "../../../services/laporan/realisasiLembur/read.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const readController = async (req, res) => {
  try {
    const result = await readService(req.query);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: "OK",
      data: result.items,
      metadata: result.metadata,
    });
  } catch (error) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default readController;