// ================================================================
// src/repositories/system/auditLog/read.repository.js
// Repository untuk read audit logs dengan filter
// ================================================================

import { AuditLog } from '../../../models/system/auditLog.model.js';
import { Op } from 'sequelize';

const readRepository = async (params, options = {}) => {
  const { page, limit, filters, orderBy } = params;

  // Build where clause
  const where = {};

  if (filters.nama_tabel) {
    where.nama_tabel = filters.nama_tabel;
  }

  if (filters.id_record) {
    where.id_record = filters.id_record;
  }

  if (filters.jenis_aksi) {
    where.jenis_aksi = filters.jenis_aksi;
  }

  if (filters.id_user_pelaku) {
    where.id_user_pelaku = filters.id_user_pelaku;
  }

  if (filters.start_date) {
    where.created_at = {
      ...where.created_at,
      [Op.gte]: filters.start_date,
    };
  }

  if (filters.end_date) {
    where.created_at = {
      ...where.created_at,
      [Op.lte]: filters.end_date,
    };
  }

  // Calculate offset
  const offset = (page - 1) * limit;

  // Execute query
  const result = await AuditLog.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: orderBy,
    ...options,
  });

  return {
    rows: result.rows.map((row) => row.toJSON()),
    count: result.count,
  };
};

export default readRepository;