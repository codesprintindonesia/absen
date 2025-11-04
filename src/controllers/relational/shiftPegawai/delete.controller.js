import { sendResponse } from "../../../helpers/response.helper.js";
import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import deleteService from "../../../services/relational/shiftPegawai/delete.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const deleteController = async (req, res) => {
  try {
    const result = await deleteService(req.params.id);
    return sendResponse(res, {
      code: HTTP_STATUS.OK,
      message: "Shift pegawai berhasil dihapus",
      data: result,
    });
  } catch (error) {
    return sendResponse(res, {
      code: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default deleteController;
