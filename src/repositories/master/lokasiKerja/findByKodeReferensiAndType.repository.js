// src/repositories/findLokasiKerja.repositories.js
import { LokasiKerja } from "../../../models/master/lokasiKerja.model.js";

/**
 * Find lokasi kerja by kode_referensi dan type_lokasi
 * @param {string} kodeReferensi
 * @param {string} typeLokasi
 * @returns {Object|null} Lokasi kerja atau null jika tidak ditemukan
 */
const findByKodeReferensiAndType = async (
  kodeReferensi,
  typeLokasi,
  options = {}
) => {
  const location = await LokasiKerja.findOne(
    {
      where: {
        kode_referensi: kodeReferensi,
        type_lokasi: typeLokasi,
      },
    },
    options
  );

  return location ? location.toJSON() : null;
};

export default findByKodeReferensiAndType;
