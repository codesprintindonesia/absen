import {
  formatErrorMessage,
  mapErrorToStatusCode,
} from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js"; 
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import createService from "../../../services/master/kebijakanAbsensi/create.service.js";
/**
 * POST /kebijakan-absensi
 * Create kebijakan absensi baru
 * */
const createController = async (req, res) => {
  try {
    const newPolicy = await createService(req.body);
    return sendResponse(res, {
      code: HTTP_STATUS.CREATED,
      message: "Kebijakan absensi berhasil dibuat",
      data: newPolicy,
    });
  } catch (error) {
    return sendResponse(res, {
      code: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default createController;
