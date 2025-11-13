// ================================================================
// src/models/system/cronJobConfig.model.js
// Model untuk konfigurasi cron job yang dapat diaktifkan/dinonaktifkan
// ================================================================

import { DataTypes } from "sequelize";
import { getSequelize } from "../../libraries/databaseInstance.library.js";

const sequelize = await getSequelize();

const CRON_JOB_TYPES = [
  "REKONSILIASI_HARIAN",
  "GENERATE_LEMBUR_BULANAN",
  "GENERATE_SHIFT_BULANAN",
  "SYNC_EXTERNAL_API",
  "CLEANUP_OLD_LOGS",
];

const CRON_JOB_STATUS = ["ENABLED", "DISABLED", "PAUSED"];

/**
 * Model untuk konfigurasi cron job
 *
 * Struktur tabel:
 * - id: Primary key (string, contoh: "CRON-REKONSILIASI")
 * - job_name: Nama job yang human-readable
 * - job_type: Tipe job (dari CRON_JOB_TYPES)
 * - cron_expression: Cron expression (contoh: "0 2 * * *")
 * - is_enabled: Flag aktif/nonaktif
 * - last_run: Waktu terakhir job dijalankan
 * - last_status: Status terakhir (SUCCESS/FAILED/PARTIAL)
 * - next_run: Waktu berikutnya job akan dijalankan (calculated)
 * - config_params: Parameter konfigurasi dalam format JSON
 * - description: Deskripsi job
 * - created_by: User yang membuat config
 * - updated_by: User yang terakhir update config
 */
const CronJobConfig = sequelize.define(
  "CronJobConfig",
  {
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      primaryKey: true,
      comment: "Unique identifier untuk cron job",
    },
    job_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Nama job yang human-readable",
    },
    job_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: { isIn: [CRON_JOB_TYPES] },
      comment: "Tipe job yang akan dijalankan",
    },
    cron_expression: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Cron expression (contoh: 0 2 * * *)",
    },
    is_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Flag untuk enable/disable job",
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "DISABLED",
      validate: { isIn: [CRON_JOB_STATUS] },
      comment: "Status job: ENABLED, DISABLED, PAUSED",
    },
    last_run: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Waktu terakhir job dijalankan",
    },
    last_status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Status terakhir: SUCCESS, FAILED, PARTIAL",
    },
    last_error: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Error message dari run terakhir (jika ada)",
    },
    next_run: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Waktu berikutnya job akan dijalankan (calculated)",
    },
    config_params: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Parameter konfigurasi dalam format JSON",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Deskripsi job",
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Asia/Makassar",
      comment: "Timezone untuk cron job",
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "SYSTEM",
    },
    updated_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "SYSTEM",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    schema: "absensi",
    tableName: "s_cron_job_config",
    modelName: "CronJobConfig",
    freezeTableName: true,
    timestamps: false, // We manage timestamps manually
    indexes: [
      { name: "idx_cron_job_type", fields: ["job_type"] },
      { name: "idx_cron_job_status", fields: ["status"] },
      { name: "idx_cron_job_enabled", fields: ["is_enabled"] },
      { name: "idx_cron_job_next_run", fields: ["next_run"] },
    ],
  }
);

export { CRON_JOB_TYPES, CRON_JOB_STATUS, CronJobConfig };
