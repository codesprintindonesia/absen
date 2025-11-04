import { sendResponse } from "../../../helpers/response.helper.js";
import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import updateAutoResolveService from "../../../services/relational/shiftPegawai/updateAutoResolve.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const updateAutoResolveController = async (req, res) => {
  try {
    const data = await updateAutoResolveService(req.params.id, req.body, req.user?.username || "SYSTEM");
    return sendResponse(res, {
      code: HTTP_STATUS.OK,
      message: "Shift pegawai (auto-resolve) berhasil diperbarui",
      data,
    });
  } catch (error) {
    return sendResponse(res, {
      code: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default updateAutoResolveController;
