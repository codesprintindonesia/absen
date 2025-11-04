// src/models/hariLibur.model.js
import { DataTypes } from "sequelize";
import { getSequelize } from "../../libraries/databaseInstance.library.js"; 
// Get sequelize instance
const sequelize = await getSequelize();

const HariLibur = sequelize.define(
  "HariLibur",
  {
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      primaryKey: true,
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
    }, 
    keterangan: {
      type: DataTypes.TEXT,
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
    tableName: "m_hari_libur",
    modelName: "HariLibur",
    freezeTableName: true,
    timestamps: false, // DB trigger handles updated_at
  }
);

// Export di akhir script sesuai coding guidelines
export { HariLibur };