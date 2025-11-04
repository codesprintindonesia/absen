// src/controllers/laporan/realisasiLembur/create.controller.js

import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import createService from "../../../services/laporan/realisasiLembur/create.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const createController = async (req, res) => {
  try {
    const result = await createService(req.body);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.CREATED,
      message: "Realisasi lembur berhasil dibuat",
      data: result,
    });
  } catch (error) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default createController;