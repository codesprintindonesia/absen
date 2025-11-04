// src/models/lokasiKerja.models.js
import { DataTypes } from "sequelize";
import { getSequelize } from "../../libraries/databaseInstance.library.js";

// Define enum constants for type_lokasi
const TYPE_LOKASI = ["DIVISI", "CABANG", "CABANG_UTAMA", "BAGIAN", "CABANG_PEMBANTU", "KANTOR_FUNGSIONAL", "UNIT_KERJA_LAIN"];

// Get sequelize instance
const sequelize = await getSequelize();

const LokasiKerja = sequelize.define(
  "LokasiKerja",
  {
    id: {
      type: DataTypes.STRING(8),
      allowNull: false,
      primaryKey: true,
    },
    kode_referensi: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    type_lokasi: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { isIn: [TYPE_LOKASI] },
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    alamat: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    radius: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 20,
      validate: { min: 1, max: 1000 },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cabang_induk: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    nama_cabang_induk: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: "m_lokasi_kerja",
    modelName: "LokasiKerja",
    freezeTableName: true,
    timestamps: false, // DB trigger handles updated_at
    indexes: [
      {
        name: "unique_kode_referensi_type",
        unique: true,
        fields: ["kode_referensi", "type_lokasi"],
      },
      { name: "idx_lokasi_type_aktif", fields: ["type_lokasi", "is_active"] },
    ],
  }
);

// Export di akhir script sesuai coding guidelines
export { TYPE_LOKASI, LokasiKerja };
