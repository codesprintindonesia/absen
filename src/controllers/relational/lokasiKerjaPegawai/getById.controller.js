import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import getById from "../../../services/relational/lokasiKerjaPegawai/getById.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const getByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const detail = await getById(id);
    return sendResponse(res, {
      code: HTTP_STATUS.OK,
      message: "Success",
      data: detail,
    });
  } catch (error) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default getByIdController;
