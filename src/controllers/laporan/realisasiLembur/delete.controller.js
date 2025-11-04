// src/controllers/laporan/realisasiLembur/delete.controller.js

import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import deleteService from "../../../services/laporan/realisasiLembur/delete.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const deleteController = async (req, res) => {
  try {
    await deleteService(req.params.id);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: "Realisasi lembur berhasil dihapus",
    });
  } catch (error) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default deleteController;