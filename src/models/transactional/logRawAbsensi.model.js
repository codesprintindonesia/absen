// src/models/transaksi/logRawAbsensi.models.js
import { DataTypes } from "sequelize";
import { getSequelize } from "../../libraries/databaseInstance.library.js";
import { LokasiKerja } from "../master/lokasiKerja.model.js";

// Define enum constants
const SOURCE_ABSENSI = ["FINGERPRINT", "MOBILE_APP", "QR_CODE"];
const STATUS_VALIDASI = ["VALID", "INVALID"];

// Get sequelize instance
const sequelize = await getSequelize();

const LogRawAbsensi = sequelize.define(
  "LogRawAbsensi",
  {
    id: {
      type: DataTypes.STRING(25),
      allowNull: false,
      primaryKey: true,
      comment: "Format: LOG-{id_pegawai}-{timestamp}"
    },
    id_pegawai: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "ID unik pegawai (dari master pegawai)"
    },
    waktu_log: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "Waktu pasti saat log dibuat (YYYY-MM-DD HH:MM:SS)"
    },
    id_device: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ID unik perangkat yang digunakan (MAC Address, IMEI, dll.)"
    },
    koordinat_gps: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "Lintang; Bujur (jika dari Smartphone)"
    },
    id_lokasi_kerja: {
      type: DataTypes.STRING(8),
      allowNull: true,
      references: {
        model: "m_lokasi_kerja",
        key: "id"
      },
      comment: "Foreign Key ke tabel master_lokasi_kerja"
    },
    is_validasi_geofence: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Hasil validasi geofence (1=Valid, 0=Invalid)"
    },
    jarak_dari_lokasi: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Jarak dalam meter dari lokasi kerja yang ditentukan"
    },
    akurasi_gps: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: "Akurasi GPS dalam meter"
    },
    path_bukti_foto: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Path penyimpanan file foto selfie saat absensi mobile"
    },
    qr_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Hash dari QR Code yang dipindai"
    },
    keterangan_log: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Catatan tambahan dari log absensi"
    },
    status_validasi: {
      type: DataTypes.STRING(15),
      allowNull: false,
      defaultValue: "VALID",
      validate: { isIn: [STATUS_VALIDASI] },
      comment: "Status: VALID (tervalidasi), INVALID (tidak valid)"
    },
    source_absensi: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { isIn: [SOURCE_ABSENSI] },
      comment: "Sumber: FINGERPRINT (mesin biometrik), MOBILE_APP (aplikasi mobile), QR_CODE (scan QR)"
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    // Denormalized fields untuk performance
    nama_pegawai: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Denormalized dari master pegawai"
    },
    kode_cabang: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "Denormalized dari master pegawai"
    },
    nama_cabang: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "Denormalized dari master pegawai"
    },
    nama_jabatan_detail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Denormalized dari master pegawai"
    }
  },
  {
    schema: "absensi",
    tableName: "t_log_raw_absensi",
    modelName: "LogRawAbsensi",
    freezeTableName: true,
    timestamps: false, // DB trigger handles updated_at
    indexes: [
      {
        name: "idx_log_absensi_waktu",
        fields: ["waktu_log"]
      },
      {
        name: "idx_log_absensi_pegawai_tanggal",
        fields: ["id_pegawai", { literal: "date(waktu_log)" }]
      },
      {
        name: "idx_log_raw_absensi_source",
        fields: ["source_absensi"]
      }
    ]
  }
);

// Define associations
LogRawAbsensi.belongsTo(LokasiKerja, {
  foreignKey: "id_lokasi_kerja",
  as: "lokasiKerja"
});

// Export di akhir script sesuai coding guidelines
export { SOURCE_ABSENSI, STATUS_VALIDASI, LogRawAbsensi };