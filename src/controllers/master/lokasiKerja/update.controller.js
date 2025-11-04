import { formatErrorMessage, mapErrorToStatusCode } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import { update } from '../../../services/master/lokasiKerja/update.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

/**
 * PUT /lokasi-kerja/:id
 * Update lokasi kerja
 */
const updateController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.id || 'SYSTEM'; // Dari auth middleware jika ada

    const updatedLocation = await update(id, updateData, userId);
    
    return sendResponse(res, {
      code: HTTP_STATUS.OK, // 200
      message: 'Lokasi kerja berhasil diupdate',
      data: updatedLocation,
      metadata: {
        updated_at: new Date().toISOString(),
        updated_by: userId
      }
    });
  } catch (error) {
    console.log(error);
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error), // 400
      message: formatErrorMessage(error)
    });
  }
};

export default updateController;