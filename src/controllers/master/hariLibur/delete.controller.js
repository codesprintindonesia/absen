// src/controllers/master/hariLibur/delete.controller.js
import {
  formatErrorMessage,
  mapErrorToStatusCode,
} from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import deleteService from "../../../services/master/hariLibur/delete.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * DELETE /hari-libur/:tanggal
 * Delete hari libur
 */
const deleteController = async (req, res) => {
  try {
    const { tanggal } = req.params;

    await deleteService(tanggal, { req });

    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK, // 200
      message: "Success",
      data: null,
    });
  } catch (error) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default deleteController;
