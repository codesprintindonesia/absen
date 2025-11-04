import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";
import createService from "../../../services/relational/lokasiKerjaPegawai/create.service.js";

const createController = async (req, res) => {
  try {
    const created = await createService(req.body);
    return sendResponse(res, {
      code: HTTP_STATUS.CREATED,
      message: "Pegawai lokasi kerja berhasil dibuat",
      data: created,
    });
  } catch (error) {
    return sendResponse(res, {
      code: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default createController;
