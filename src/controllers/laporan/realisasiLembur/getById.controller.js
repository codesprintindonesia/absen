// src/controllers/laporan/realisasiLembur/getById.controller.js

import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import getByIdService from "../../../services/laporan/realisasiLembur/getById.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const getByIdController = async (req, res) => {
  try {
    const result = await getByIdService(req.params.id);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: "OK",
      data: result,
    });
  } catch (error) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default getByIdController;