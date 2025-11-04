// ================================================================
// src/controllers/master/hariLibur/update.controller.js
// Controller untuk update hari libur DENGAN AUDIT LOG
// ================================================================

import {
  formatErrorMessage,
  mapErrorToStatusCode,
} from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import updateService from "../../../services/master/hariLibur/update.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * PUT /hari-libur/:tanggal
 * Update hari libur
 */
const updateController = async (req, res) => {
  try {
    const { tanggal } = req.params;

    // Pass req object ke service untuk audit log
    const holiday = await updateService(tanggal, req.body, { req });

    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK, // 200
      message: "Hari libur berhasil diupdate",
      data: holiday,
    });
  } catch (error) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default updateController;
