import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import deleteService from "../../../services/relational/lokasiKerjaPegawai/delete.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

const deleteController = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteService(id);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: "Pegawai lokasi kerja berhasil dihapus",
      data: result,
    });
  } catch (error) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default deleteController;
