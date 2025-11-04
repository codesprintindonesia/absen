// src/models/relational/lokasiKerjaPegawai.model.js
import { DataTypes } from "sequelize";
import { getSequelize } from "../../libraries/databaseInstance.library.js";

// dapatkan instance sequelize
const sequelize = await getSequelize();  

// Definisi model LokasiKerjaPegawai
const LokasiKerjaPegawai = sequelize.define(
  "LokasiKerjaPegawai",
  {
    id: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true,
    },
    id_pegawai: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    id_lokasi_kerja: {
      type: DataTypes.STRING(8),
      allowNull: false,
    },
    tanggal_mulai_berlaku: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tanggal_akhir_berlaku: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    }, 
    prioritas_lokasi: {
      type: DataTypes.INTEGER, // int4
      allowNull: true,
      defaultValue: 1,
      validate: { min: 1 },
    }, 
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    }, 
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
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
    id_personal: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  },
  {
    schema: "absensi",
    tableName: "r_lokasi_kerja_pegawai",
    modelName: "LokasiKerjaPegawai",
    freezeTableName: true,
    timestamps: false, // trigger DB yang mengurus updated_at
    indexes: [
      // CREATE INDEX idx_pegawai_lokasi_aktif ON absensi.r_lokasi_kerja_pegawai (id_pegawai, is_active, tanggal_mulai_berlaku, tanggal_akhir_berlaku)
      {
        name: "idx_pegawai_lokasi_aktif",
        fields: [
          "id_pegawai", 
          "tanggal_mulai_berlaku",
          "tanggal_akhir_berlaku",
        ], // NOTE: jika ingin persis seperti DDL 
      },
      // CREATE INDEX idx_pegawai_lokasi_prioritas ON absensi.r_lokasi_kerja_pegawai (id_pegawai, prioritas_lokasi 
      {
        name: "idx_pegawai_lokasi_prioritas",
        fields: ["id_pegawai", "prioritas_lokasi"],
      },
    ],
  }
);

export { LokasiKerjaPegawai };
