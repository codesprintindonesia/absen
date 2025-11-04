// src/models/transactional/shiftHarianPegawai.model.js
import { DataTypes } from "sequelize";
import { getSequelize } from "../../libraries/databaseInstance.library.js";

const sequelize = await getSequelize(); 

const ShiftHarianPegawai = sequelize.define(
  "ShiftHarianPegawai",
  {
    id: {
      type: DataTypes.STRING(18),
      allowNull: false,
      primaryKey: true,
    },
    id_pegawai: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    tanggal_kerja: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    id_shift_kerja_jadwal: {
      type: DataTypes.STRING(8),
      allowNull: false,
      comment: "Shift dari jadwal awal"
    },
    id_shift_kerja_aktual: {
      type: DataTypes.STRING(8),
      allowNull: false,
      comment: "Shift yang digunakan untuk rekonsiliasi"
    },
    id_lokasi_kerja_jadwal: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: "Lokasi dari jadwal awal"
    },
    id_lokasi_kerja_aktual: {
      type: DataTypes.STRING(8),
      allowNull: false,
      comment: "Lokasi yang digunakan untuk rekonsiliasi"
    },
    id_pegawai_pengganti: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    alasan_perubahan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Denormalized fields
    nama_pegawai: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Denormalized dari master pegawai"
    },
    nama_pengganti: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Nama pegawai pengganti"
    },
    id_personal: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "Denormalized dari master pegawai"
    },
    id_personal_pengganti: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "ID personal pegawai pengganti"
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    schema: "absensi",
    tableName: "t_shift_harian_pegawai",
    modelName: "ShiftHarianPegawai",
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        name: "idx_shift_harian_pegawai_tanggal",
        unique: true,
        fields: ["id_pegawai", "tanggal_kerja"],
      },
      { name: "idx_shift_harian_tanggal", fields: ["tanggal_kerja"] },
    ],
  }
);

export { ShiftHarianPegawai };