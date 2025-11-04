import { sendResponse } from "../../../helpers/response.helper.js";
import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import updateService from "../../../services/transactional/logRawAbsensi/update.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const updateController = async (req, res) => {
  try {
    const updated = await updateService(req.params.id, req.body);
    return sendResponse(res, {
      code: HTTP_STATUS.OK,
      message: "Log raw absensi berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    return sendResponse(res, {
      code: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default updateController;
