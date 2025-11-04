// src/controllers/laporan/realisasiLembur/update.controller.js

import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import updateService from "../../../services/laporan/realisasiLembur/update.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const updateController = async (req, res) => {
  try {
    const result = await updateService(req.params.id, req.body);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: "Realisasi lembur berhasil diupdate",
      data: result,
    });
  } catch (error) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default updateController;