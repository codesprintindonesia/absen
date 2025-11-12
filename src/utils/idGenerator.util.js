// ================================================================
// src/utils/idGenerator.util.js
// Utility untuk generate ID dengan format standar
// ================================================================

import { customAlphabet } from 'nanoid';

/**
 * Generate nanoid dengan karakter alphanumeric (angka + huruf kapital)
 * Menggunakan 36 karakter: 0-9, A-Z
 * Menghindari huruf kecil untuk konsistensi
 */
const nanoidAlphaNumeric = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

/**
 * Generate ID untuk Master entities
 * Format: {PREFIX}-{NNNNNN} (10 karakter total)
 * Contoh: LOK-A1B2C3, KEB-9X7Y5Z, SFT-123456
 *
 * Kapasitas: 36^6 = 2,176,782,336 kombinasi unik
 *
 * @param {string} prefix - 3 huruf prefix (LOK, KEB, SFT, dll)
 * @returns {string} ID dengan format PREFIX-NNNNNN
 */
export function generateMasterId(prefix) {
  if (!prefix || prefix.length !== 3) {
    throw new Error('Prefix must be exactly 3 characters');
  }

  const randomStr = nanoidAlphaNumeric();
  return `${prefix.toUpperCase()}-${randomStr}`;
}

/**
 * Generate ID untuk Relational entities
 * Format bervariasi tergantung kebutuhan
 */

/**
 * Shift Group Detail: {PREFIX}-{id_shift_group}-{id_shift_kerja}-{NNNN}
 * Contoh: SGD-SGP3A1B2C-SFT8B3C2D-X7Y9
 *
 * Context-rich ID untuk debugging dan troubleshooting
 * Length: ~35-40 chars (depends on FK lengths)
 * Collision risk: Virtually zero (36^4 = 1.6M per group-shift pair)
 */
export function generateShiftGroupDetailId(idShiftGroup, idShiftKerja) {
  if (!idShiftGroup) {
    throw new Error('idShiftGroup is required for generating Shift Group Detail ID');
  }
  if (!idShiftKerja) {
    throw new Error('idShiftKerja is required for generating Shift Group Detail ID');
  }

  const prefix = 'SGD';
  const randomSuffix = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4)();
  return `${prefix}-${idShiftGroup}-${idShiftKerja}-${randomSuffix}`;
}

/**
 * Shift Pegawai: {PREFIX}-{id_pegawai}-{id_shift}-{NNNN}
 * Contoh: SHP-EMP001-SFT8B3C2D-X7Y9
 *
 * Context-rich ID untuk debugging dan troubleshooting
 * Supports either id_shift_kerja OR id_shift_group
 * Length: ~30-35 chars (depends on FK lengths)
 * Collision risk: Virtually zero (36^4 = 1.6M per pegawai-shift pair)
 */
export function generateShiftPegawaiId(idPegawai, idShiftOrGroup) {
  if (!idPegawai) {
    throw new Error('idPegawai is required for generating Shift Pegawai ID');
  }
  if (!idShiftOrGroup) {
    throw new Error('idShiftKerja or idShiftGroup is required for generating Shift Pegawai ID');
  }

  const prefix = 'SHP';
  const randomSuffix = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4)();
  return `${prefix}-${idPegawai}-${idShiftOrGroup}-${randomSuffix}`;
}

/**
 * Lokasi Kerja Pegawai: {PREFIX}-{id_pegawai}-{id_lokasi_kerja}-{NNNN}
 * Contoh: LKP-EMP001-LOK5A7B2C-X7Y9
 *
 * Context-rich ID untuk debugging dan troubleshooting
 * Length: ~30-35 chars (depends on FK lengths)
 * Collision risk: Virtually zero (36^4 = 1.6M per pegawai-lokasi pair)
 */
export function generateLokasiKerjaPegawaiId(idPegawai, idLokasiKerja) {
  if (!idPegawai) {
    throw new Error('idPegawai is required for generating Lokasi Kerja Pegawai ID');
  }
  if (!idLokasiKerja) {
    throw new Error('idLokasiKerja is required for generating Lokasi Kerja Pegawai ID');
  }

  const prefix = 'LKP';
  const randomSuffix = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4)();
  return `${prefix}-${idPegawai}-${idLokasiKerja}-${randomSuffix}`;
}

/**
 * Log Raw Absensi: LOG-{id_pegawai}-{timestamp} (25 karakter max)
 * Contoh: LOG-EMP001-1705034400
 */
export function generateLogRawAbsensiId(idPegawai, waktuLog = new Date()) {
  if (!idPegawai) {
    throw new Error('idPegawai is required for generating Log Raw Absensi ID');
  }

  const prefix = 'LOG';
  const timestamp = Math.floor(waktuLog.getTime() / 1000); // Unix timestamp
  return `${prefix}-${idPegawai}-${timestamp}`;
}

/**
 * Realisasi Lembur: LBR-{id_pegawai}-{YYYYMM} (20 karakter max)
 * Contoh: LBR-EMP001-202501
 */
export function generateRealisasiLemburId(idPegawai, periodeBulan) {
  if (!idPegawai) {
    throw new Error('idPegawai is required for generating Realisasi Lembur ID');
  }

  const prefix = 'LBR';
  const periode = periodeBulan.replace(/-/g, '').substring(0, 6); // YYYYMM
  return `${prefix}-${idPegawai}-${periode}`;
}

/**
 * Shift Harian Pegawai: SHR-{id_pegawai}-{YYYYMMDD} (18 karakter max)
 * Contoh: SHR-EMP001-20250112
 */
export function generateShiftHarianPegawaiId(idPegawai, tanggal) {
  if (!idPegawai) {
    throw new Error('idPegawai is required for generating Shift Harian Pegawai ID');
  }

  const prefix = 'SHR';
  const dateStr = tanggal.replace(/-/g, ''); // YYYYMMDD
  return `${prefix}-${idPegawai}-${dateStr}`;
}

/**
 * Generate ID untuk System entities
 */

/**
 * Audit Log: AUD-{YYYYMMDD}-{nanoid(5)} (18 karakter max)
 * Contoh: AUD-20250112-a1B2c
 */
export function generateAuditLogId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const prefix = 'AUD';
  const randomStr = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 5)();
  return `${prefix}-${dateStr}-${randomStr}`;
}

/**
 * Absensi Harian: ABS-{id_pegawai}-{YYYYMMDD} (25 karakter max)
 * Contoh: ABS-EMP001-20250112
 */
export function generateAbsensiHarianId(idPegawai, tanggal) {
  if (!idPegawai) {
    throw new Error('idPegawai is required for generating Absensi Harian ID');
  }

  const prefix = 'ABS';
  const dateObj = typeof tanggal === 'string' ? new Date(tanggal) : tanggal;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  return `${prefix}-${dateStr}-${idPegawai}`;
}

/**
 * Proses Harian: PRC-{YYYYMMDD}-{timestamp(6)} (20 karakter max)
 * Contoh: PRC-20250112-123456
 */
export function generateProsesHarianId(tanggal) {
  const prefix = 'PRC';
  const dateObj = typeof tanggal === 'string' ? new Date(tanggal) : tanggal;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  // Use last 6 digits of timestamp for uniqueness
  const timestamp = String(Date.now()).slice(-6);

  return `${prefix}-${dateStr}-${timestamp}`;
}

/**
 * Prefix constants untuk master entities
 */
export const ID_PREFIX = {
  // Master
  LOKASI_KERJA: 'LOK',
  KEBIJAKAN_ABSENSI: 'KEB',
  SHIFT_KERJA: 'SHK',
  SHIFT_GROUP: 'SGR',

  // Relational
  SHIFT_GROUP_DETAIL: 'SGD',
  SHIFT_PEGAWAI: 'SHP',
  LOKASI_KERJA_PEGAWAI: 'LKP',

  // Transactional
  LOG_RAW_ABSENSI: 'LOG',
  REALISASI_LEMBUR: 'LBR',
  SHIFT_HARIAN_PEGAWAI: 'SHR',
  ABSENSI_HARIAN: 'ABS',

  // System
  AUDIT_LOG: 'AUD',
  PROSES_HARIAN: 'PRC',
};

/**
 * Validate ID format
 * @param {string} id - ID to validate
 * @param {string} prefix - Expected prefix
 * @returns {boolean}
 */
export function validateIdFormat(id, prefix) {
  if (!id || typeof id !== 'string') return false;
  return id.startsWith(`${prefix}-`);
}

export default {
  generateMasterId,
  generateShiftGroupDetailId,
  generateShiftPegawaiId,
  generateLokasiKerjaPegawaiId,
  generateLogRawAbsensiId,
  generateRealisasiLemburId,
  generateShiftHarianPegawaiId,
  generateAuditLogId,
  generateAbsensiHarianId,
  generateProsesHarianId,
  ID_PREFIX,
  validateIdFormat,
};
