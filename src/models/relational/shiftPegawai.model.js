import { DataTypes } from "sequelize";
import { getSequelize } from "../../libraries/databaseInstance.library.js";

// dapatkan instance sequelize
const sequelize = await getSequelize();

const ShiftPegawai = sequelize.define(
  "ShiftPegawai",
  {
    id: {
      type: DataTypes.STRING(40),
      allowNull: false,
      primaryKey: true,
    },
    id_pegawai: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    id_shift_kerja: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    id_shift_group: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    tanggal_mulai: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tanggal_akhir: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isAfterOrEqual(value) {
          if (value && this.tanggal_mulai && value < this.tanggal_mulai) {
            throw new Error(
              "tanggal_akhir tidak boleh lebih kecil dari tanggal_mulai"
            );
          }
        },
      },
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
      allowNull: false,
    },
    nama_pegawai: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    offset_rotasi_hari: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    schema: "absensi",
    tableName: "r_shift_pegawai",
    modelName: "ShiftPegawai",
    freezeTableName: true,
    timestamps: false, // trigger DB yang mengatur updated_at
  }
);

export { ShiftPegawai };
