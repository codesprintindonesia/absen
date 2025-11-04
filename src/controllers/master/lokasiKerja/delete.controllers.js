import { formatErrorMessage } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import { deleteLokasiKerja } from '../../../services/master/lokasiKerja/delete.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

/**
 * DELETE /lokasi-kerja/:id
 * Hard delete lokasi kerja
 */
const deleteController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'SYSTEM';

    const deleteResult = await deleteLokasiKerja(id, userId);
    
    return sendResponse(res, {
      code: HTTP_STATUS.OK, // 200
      message: 'Lokasi kerja berhasil dihapus',
      data: deleteResult,
      metadata: {
        operation: 'hard_delete',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.log(error);
    return sendResponse(res, {
      code: HTTP_STATUS.BAD_REQUEST,
      message: formatErrorMessage(error)
    });
  }
};

export default deleteController;