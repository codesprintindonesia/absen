// src//models/master/shiftKerja.model.js
import { DataTypes } from 'sequelize';
import { getSequelize } from '../../libraries/databaseInstance.library.js'; 

// Dapatkan instance sequelize
const sequelize = await getSequelize();

const ShiftKerja = sequelize.define('m_shift_kerja', {
  id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    primaryKey: true,
  }, 
  nama: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  jam_masuk: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  jam_pulang: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  durasi_istirahat: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 60,
    validate: { min: 0, max: 240 },             // sesuai check constraint:contentReference[oaicite:2]{index=2}
  },
  hari_kerja: {
    type: DataTypes.JSONB,
    allowNull: false,
  },  
  toleransi_keterlambatan: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 15,
    validate: { min: 0 },
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
}, {
  schema: 'absensi',
  tableName: 'm_shift_kerja',
  modelName: 'ShiftKerja',
  freezeTableName: true,
  timestamps: false,
});

export { ShiftKerja };
