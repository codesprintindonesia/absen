import { sendResponse } from "../../../helpers/response.helper.js";
import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import createAutoResolveService from "../../../services/relational/shiftPegawai/createAutoResolve.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const createAutoResolveController = async (req, res) => {
  try {
    const data = await createAutoResolveService(req.body, req.user?.username || "SYSTEM");
    return sendResponse(res, {
      code: HTTP_STATUS.CREATED,
      message: "Shift pegawai (auto-resolve) berhasil dibuat",
      data,
    });
  } catch (error) {
    return sendResponse(res, {
      code: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default createAutoResolveController;
