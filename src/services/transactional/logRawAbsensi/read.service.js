import readRepository from "../../../repositories/transactional/logRawAbsensi/read.repository.js";

const readService = async (queryParams) => {
  const {
    page = 1,
    limit = 20,
    id_pegawai,
    id_lokasi_kerja,
    source_absensi,
    status_validasi,
    waktu_log_from,
    waktu_log_to,
    tanggal_from,
    tanggal_to,
    // 🔎 new
    search,
    search_fields,
  } = queryParams;

  const filters = {};
  if (id_pegawai) filters.id_pegawai = id_pegawai;
  if (id_lokasi_kerja) filters.id_lokasi_kerja = id_lokasi_kerja;
  if (source_absensi) filters.source_absensi = source_absensi;
  if (status_validasi) filters.status_validasi = status_validasi;

  if (waktu_log_from) filters.waktu_log_from = waktu_log_from;
  if (waktu_log_to) filters.waktu_log_to = waktu_log_to;

  if (tanggal_from) filters.tanggal_from = tanggal_from;
  if (tanggal_to) filters.tanggal_to = tanggal_to;

  // 🔎 forward advanced search
  if (typeof search !== "undefined") filters.search = search;
  if (Array.isArray(search_fields) && search_fields.length > 0) {
    filters.search_fields = search_fields;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    filters,
    orderBy: [["waktu_log", "DESC"]],
  };

  const result = await readRepository(options);

  return {
    items: result.rows,
    metadata: {
      page: options.page,
      limit: options.limit,
      total: result.count,
      totalPages: Math.ceil(result.count / options.limit),
      hasNext: options.page * options.limit < result.count,
      hasPrev: options.page > 1,
    },
  };
};

export default readService;
