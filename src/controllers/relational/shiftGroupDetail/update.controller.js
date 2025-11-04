import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import updateService from "../../../services/relational/shiftGroupDetail/update.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const updateController = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedDetail = await updateService(id, req.body);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: "Shift group detail berhasil diperbarui",
      data: updatedDetail,
    });
  } catch (error) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default updateController;
