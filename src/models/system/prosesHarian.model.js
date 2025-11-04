// src//models/system/prosesHarian.model.js
import { DataTypes } from "sequelize";
import { getSequelize } from "../../libraries/databaseInstance.library.js";

const sequelize = await getSequelize();

const JENIS_PROSES = [
  "REKONSILIASI",
  "VALIDASI",
  "BACKUP",
  "SYNC_API",
  "CLEANUP",
];

const STATUS_PROSES = ["SUCCESS", "PARTIAL", "FAILED"];

const ProsesHarian = sequelize.define(
  "ProsesHarian",
  {
    id: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true,
    },
    tanggal_proses: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    jenis_proses: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { isIn: [JENIS_PROSES] },
    },
    status_proses: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { isIn: [STATUS_PROSES] },
    },
    waktu_mulai: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    waktu_selesai: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total_data_diproses: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    jumlah_success: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    jumlah_error: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    detail_error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    schema: "absensi",
    tableName: "s_proses_harian",
    modelName: "ProsesHarian",
    freezeTableName: true,
    timestamps: false,
    indexes: [
      { name: "idx_proses_tanggal", fields: ["tanggal_proses"] },
      { name: "idx_proses_jenis", fields: ["jenis_proses"] },
      { name: "idx_proses_status", fields: ["status_proses"] },
    ],
  }
);

export { JENIS_PROSES, STATUS_PROSES, ProsesHarian };