import { sendResponse } from "../../../helpers/response.helper.js";
import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import createService from "../../../services/transactional/logRawAbsensi/create.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const createController = async (req, res) => {
  try {
    const data = await createService(req.body);
    return sendResponse(res, {
      code: HTTP_STATUS.CREATED,
      message: "Log raw absensi berhasil dibuat",
      data,
    });
  } catch (error) {
    return sendResponse(res, {
      code: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default createController;
