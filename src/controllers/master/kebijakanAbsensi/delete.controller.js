import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import deleteKebijakanAbsensi from '../../../services/master/kebijakanAbsensi/delete.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const deleteController = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteKebijakanAbsensi(id);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: 'Kebijakan absensi berhasil dihapus',
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
