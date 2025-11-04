import { formatErrorMessage } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import  getById from '../../../services/master/kebijakanAbsensi/getById.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

/**
 * GET /lokasi-kerja/:id
 * Get lokasi kerja by ID
 */
const getByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    
    const location = await getById(id);
    
    return sendResponse(res, {
      code: HTTP_STATUS.OK, // 200
      message: 'Success',
      data: location
    });
  } catch (error) {
    console.log(error);
    return sendResponse(res, {
      code: HTTP_STATUS.BAD_REQUEST, // 400
      message: formatErrorMessage(error)
    });
  }
};

export default getByIdController;