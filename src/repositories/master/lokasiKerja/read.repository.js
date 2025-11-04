// src/repositories/master/lokasiKerja/read.repository.js
import { LokasiKerja } from "../../../models/master/lokasiKerja.model.js";
import { Op } from "sequelize";

/**
 * Repository untuk read lokasi kerja dengan filtering
 * Direct database operation only
 * @param {Object} params - params untuk query
 * @returns {Object} Result dengan rows dan count
 */
const read = async (params, options = {}) => {
  const { page = 1, limit = 20, filters, orderBy } = params;

  // Build where clause dari filters
  const where = {};

  if (filters.type_lokasi) {
    where.type_lokasi = filters.type_lokasi;
  }

  if (filters.is_active !== undefined) {
    where.is_active = filters.is_active;
  }

  if (filters.search) {
    where[Op.or] = [
      { nama: { [Op.iLike]: `%${filters.search}%` } },
      { alamat: { [Op.iLike]: `%${filters.search}%` } },
    ];
  }

  // Calculate offset untuk pagination
  const offset = (page - 1) * limit;

  // Execute query
  const result = await LokasiKerja.findAndCountAll(
    {
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: orderBy,
    },
    options
  );

  return {
    rows: result.rows.map((row) => row.toJSON()),
    count: result.count,
  };
};

export default read;
