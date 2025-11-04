// src/repositories/laporan/realisasiLembur/read.repository.js

import { RealisasiLembur } from "../../../models/laporan/realisasiLembur.model.js";
import { Op } from "sequelize";

const readRepository = async (params, options = {}) => {
  const { page = 1, limit = 20, filters = {}, orderBy } = params;
  
  const where = {};

  if (filters.id_pegawai) {
    where.id_pegawai = filters.id_pegawai;
  }

  if (filters.periode_bulan_lembur) {
    where.periode_bulan_lembur = filters.periode_bulan_lembur;
  }

  if (typeof filters.is_data_final !== "undefined") {
    where.is_data_final = filters.is_data_final;
  }

  if (filters.search) {
    where[Op.or] = [
      { nama_pegawai: { [Op.iLike]: `%${filters.search}%` } },
      { nama_cabang: { [Op.iLike]: `%${filters.search}%` } },
      { nama_divisi: { [Op.iLike]: `%${filters.search}%` } },
    ];
  }

  const offset = (page - 1) * limit;

  const result = await RealisasiLembur.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: orderBy || [["periode_bulan_lembur", "DESC"], ["id_pegawai", "ASC"]],
    ...options,
  });

  return {
    rows: result.rows.map((r) => r.toJSON()),
    count: result.count,
  };
};

export default readRepository;