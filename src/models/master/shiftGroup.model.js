// src//models/master/shiftGroup.model.js
import { DataTypes } from "sequelize";
import { getSequelize } from "../../libraries/databaseInstance.library.js";

// Mendapatkan instance Sequelize
const sequelize = await getSequelize();

// Definisikan model ShiftGroup
const ShiftGroup = sequelize.define(
  "ShiftGroup",
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
    durasi_rotasi_hari: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      validate: { min: 1 }, // sesuai constraint durasi > 0:contentReference[oaicite:1]{index=1}
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
  },
  {
    schema: "absensi",
    tableName: "m_shift_group", // sesuai nama tabel di DB:contentReference[oaicite:2]{index=2}
    modelName: "ShiftGroup",
    freezeTableName: true,
    timestamps: false, // trigger DB yang mengurus updated_at
  }
);

// Ekspor default model
export default ShiftGroup;
