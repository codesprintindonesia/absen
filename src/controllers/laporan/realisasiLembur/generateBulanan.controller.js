// src/controllers/laporan/realisasiLembur/generateBulanan.controller.js

import { formatErrorMessage, mapErrorToStatusCode } from "../../../helpers/error.helper.js";
import { sendResponse } from "../../../helpers/response.helper.js";
import { generateRealisasiLemburBulanan } from "../../../services/laporan/realisasiLembur/generateBulanan.service.js";
import { getSequelize } from "../../../libraries/databaseInstance.library.js";
import HTTP_STATUS from "../../../constants/httpStatus.constant.js";

/**
 * Generate realisasi lembur bulanan untuk satu pegawai
 * POST /api/v1/realisasi-lembur/generate
 * Body: { id_pegawai, periode_bulan_lembur }
 */
const generateBulananController = async (req, res) => {
  const sequelize = await getSequelize();
  const transaction = await sequelize.transaction();

  try {
    const { id_pegawai, periode_bulan_lembur } = req.body;

    const result = await generateRealisasiLemburBulanan(
      id_pegawai,
      periode_bulan_lembur,
      transaction
    );

    await transaction.commit();

    return sendResponse(res, {
      httpCode: HTTP_STATUS.OK,
      message: "Realisasi lembur bulanan berhasil di-generate",
      data: result.data,
      metadata: result.summary,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    return sendResponse(res, {
      httpCode: mapErrorToStatusCode(error),
      message: formatErrorMessage(error),
    });
  }
};

export default generateBulananController;