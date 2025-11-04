// src/controllers/laporan/realisasiLembur/generateBulananAllPegawai.controller.js

import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import { generateRealisasiLemburBulananAllPegawai } from "../../../services/laporan/realisasiLembur/generateBulanan.service.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * Generate realisasi lembur bulanan untuk semua pegawai
 * POST /api/v1/realisasi-lembur/generate-all
 * Body: { periode_bulan_lembur }
 */
const generateBulananAllPegawaiController = async (req, res) => {
  try {
    const { periode_bulan_lembur } = req.body;

    const result = await generateRealisasiLemburBulananAllPegawai(periode_bulan_lembur);

    if (!result.success) {
      return sendResponse(res, {
        httpCode: HTTP_STATUS.PARTIAL_CONTENT,
        message: result.message,
        data: result.results,
        metadata: {
          periode: result.periode,
          total_pegawai: result.total_pegawai,
          total_success: result.total_success,
          total_error: result.total_error,
          errors: result.errors,
        },
      });
    }

    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: `Realisasi lembur bulanan berhasil di-generate untuk ${result.total_success} dari ${result.total_pegawai} pegawai`,
      data: result.results,
      metadata: {
        periode: result.periode,
        total_pegawai: result.total_pegawai,
        total_success: result.total_success,
        total_error: result.total_error,
      },
    });
  } catch (error) {
    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default generateBulananAllPegawaiController;