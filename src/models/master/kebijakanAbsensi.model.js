// src/models/kebijakanAbsensi.models.js
import { DataTypes } from "sequelize";
import { getSequelize } from "../../libraries/databaseInstance.library.js";
 

// Instance sequelize (menyesuaikan gaya contohmu)
const sequelize = await getSequelize();

const KebijakanAbsensi = sequelize.define(
  "m_kebijakan_absensi",
  {
    id: {
      type: DataTypes.STRING(8),
      allowNull: false,
      primaryKey: true,
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
    }, 
    toleransi_keterlambatan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
      validate: { min: 0 }, // CHECK (>= 0)
    },
    min_jam_kerja_full_day: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      defaultValue: 8.0,
      validate: {
        isValid(value) {
          if (value != null && Number(value) <= 0) {
            throw new Error("min_jam_kerja_full_day harus > 0");
          }
        },
      },
    },
    aturan_potongan_terlambat: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    kebijakan_lembur_otomatis: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    jam_cut_off_hari: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: "23:59:59",
    }, 
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
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
  },
  {
    schema: "absensi",
    tableName: "m_kebijakan_absensi",
    modelName: "KebijakanAbsensi",
    freezeTableName: true,
    timestamps: false, // trigger DB yang urus updated_at
    // Tambahan opsional: index ringan untuk query umum
    // indexes: [
    //   { name: 'idx_kebijakan_aktif', fields: ['is_active'] }, 
    // ],
  }
);

// Export di akhir script sesuai gaya contohmu
export { KebijakanAbsensi };
