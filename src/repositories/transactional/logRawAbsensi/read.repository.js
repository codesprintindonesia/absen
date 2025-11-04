import { Op } from "sequelize";
import { LogRawAbsensi } from "../../../models/transactional/logRawAbsensi.model.js";

const DEFAULT_SEARCH_FIELDS = [
  "keterangan_log",
  "qr_hash",
  "id_device",
  "koordinat_gps",
  "nama_pegawai",
  "kode_cabang",
  "nama_cabang",
  "nama_jabatan_detail",
  "source_absensi",
  "status_validasi",
];

const readRepository = async (params, options = {}) => {
  const { page, limit, filters = {}, orderBy } = params;
  const where = {};

  if (filters.id_pegawai) where.id_pegawai = filters.id_pegawai;
  if (filters.id_lokasi_kerja) where.id_lokasi_kerja = filters.id_lokasi_kerja;
  if (filters.source_absensi) where.source_absensi = filters.source_absensi;
  if (filters.status_validasi) where.status_validasi = filters.status_validasi;

  // filter by timestamp range
  if (filters.waktu_log_from || filters.waktu_log_to) {
    where.waktu_log = {};
    if (filters.waktu_log_from) where.waktu_log[Op.gte] = filters.waktu_log_from;
    if (filters.waktu_log_to) where.waktu_log[Op.lte] = filters.waktu_log_to;
  }

  // filter by DATE(waktu_log)
  if (filters.tanggal_from || filters.tanggal_to) {
    const andArr = where[Op.and] || [];
    if (filters.tanggal_from) {
      andArr.push(LogRawAbsensi.sequelize.literal(`date(waktu_log) >= '${filters.tanggal_from}'`));
    }
    if (filters.tanggal_to) {
      andArr.push(LogRawAbsensi.sequelize.literal(`date(waktu_log) <= '${filters.tanggal_to}'`));
    }
    if (andArr.length) where[Op.and] = andArr;
  }

  // 🔎 advanced free-text search (case-insensitive)
  if (typeof filters.search !== "undefined" && filters.search !== null) {
    const q = String(filters.search).trim();
    if (q.length > 0) {
      const fields = Array.isArray(filters.search_fields) && filters.search_fields.length > 0
        ? filters.search_fields
        : DEFAULT_SEARCH_FIELDS;

      const orClauses = fields.map((col) => ({
        [col]: { [Op.iLike]: `%${q.replace(/[%_]/g, "\\$&")}%` }, // escape % _
      }));

      // gabungkan dengan where existing
      where[Op.and] = [...(where[Op.and] || []), { [Op.or]: orClauses }];
    }
  }

  const offset = (page - 1) * limit;

  const result = await LogRawAbsensi.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: orderBy || [["waktu_log", "DESC"]],
    ...options,
  });

  return {
    rows: result.rows.map((r) => r.toJSON()),
    count: result.count,
  };
};

export default readRepository;
