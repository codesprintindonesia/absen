import { formatErrorMessage } from '../../../helpers/error.helper.js';
import { sendResponse } from '../../../helpers/response.helper.js';
import { checkDeleteImpact } from '../../../services/master/lokasiKerja/checkDeleteImpact.service.js';
import HTTP_STATUS from '../../../constants/httpStatus.constant.js';

/**
 * GET /lokasi-kerja/:id/delete-impact
 * Check dampak delete sebelum melakukan delete
 */
const checkDeleteImpactController = async (req, res) => {
  try {
    const { id } = req.params;

    const impactAnalysis = await checkDeleteImpact(id);
    
    return sendResponse(res, {
      code: HTTP_STATUS.OK, // 200
      message: 'Analysis delete impact berhasil',
      data: impactAnalysis,
      metadata: {
        operation: 'delete_impact_analysis',
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

export default checkDeleteImpactController;