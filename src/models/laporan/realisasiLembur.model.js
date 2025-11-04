// src/models/laporan/realisasiLembur.model.js

import { DataTypes } from "sequelize";
import { getSequelize } from "../../libraries/databaseInstance.library.js";

const sequelize = await getSequelize();

const RealisasiLembur = sequelize.define(
  "RealisasiLembur",
  {
    id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
    },
    id_pegawai: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    periode_bulan_lembur: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    total_jam_lembur_bulanan: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    total_hari_terlambat_bulanan: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    rata_menit_keterlambatan: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    total_hari_tidak_hadir: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    total_hari_kerja_efektif: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    persentase_kehadiran: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    is_data_final: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    tanggal_finalisasi_data: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    difinalisasi_oleh: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    nama_pegawai: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    kode_cabang: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    nama_cabang: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    id_divisi: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    nama_divisi: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    nama_jabatan_detail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "l_realisasi_lembur",
    schema: "absensi",
    timestamps: false,
    indexes: [
      {
        name: "idx_lembur_periode",
        fields: ["periode_bulan_lembur", "is_data_final"],
      },
      {
        unique: true,
        fields: ["id_pegawai", "periode_bulan_lembur"],
      },
    ],
  }
);

export { RealisasiLembur };