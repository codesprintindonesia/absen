// ================================================================
// src/models/system/auditLog.model.js
// Model untuk s_audit_log
// ================================================================

import { DataTypes } from 'sequelize';
import { getSequelize } from '../../libraries/databaseInstance.library.js';

const sequelize = await getSequelize();

export const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: {
      type: DataTypes.STRING(25),
      primaryKey: true,
      allowNull: false,
    },
    nama_tabel: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    id_record: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    jenis_aksi: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [['INSERT', 'UPDATE', 'DELETE']],
      },
    },
    data_lama: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    data_baru: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    id_user_pelaku: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    alamat_ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent_info: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    alasan_perubahan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 's_audit_log',
    schema: 'absensi',
    timestamps: false,
  }
);