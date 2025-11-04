import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import update from '../../../services/master/kebijakanAbsensi/update.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

const updateController = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedPolicy = await update(id, req.body);
    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: 'Kebijakan absensi berhasil diperbarui',
      data: updatedPolicy,
    });
  } catch (error) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default updateController;
