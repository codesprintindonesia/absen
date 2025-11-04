import { sendResponse } from "../../../helpers/response.helper.js";
import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import getByIdService from "../../../services/relational/shiftPegawai/getById.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const getByIdController = async (req, res) => {
  try {
    const detail = await getByIdService(req.params.id);
    return sendResponse(res, {
      code: HTTP_STATUS.OK,
      message: "Success",
      data: detail,
    });
  } catch (error) {
    return sendResponse(res, {
      code: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default getByIdController;
