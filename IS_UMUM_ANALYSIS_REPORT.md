# Analisis Kolom `is_umum` di Tabel `m_shift_kerja`

**Tanggal:** 2025-11-17
**Status:** 🔍 Analysis Complete

---

## 📊 Hasil Analisis Database

### Kolom Info
- **Nama:** `is_umum`
- **Type:** `boolean`
- **Nullable:** YES
- **Default:** `true`

### Distribusi Data (Current)
| Nilai | Jumlah | Sample IDs |
|-------|--------|------------|
| TRUE | 5 shift | SHF-0001, SHF-MALAM, SHF-OFF, SHF-PAGI, SHF-SIANG |
| FALSE | 5 shift | SHF-0002, SHF-0003, SHF-0004, SHF-0005, SHF-0006 |

### Sample Data
| ID | Nama | is_umum | Keterangan |
|----|------|---------|------------|
| SHF-0001 | Shift Normal Kantor | TRUE | Shift umum |
| SHF-PAGI | Shift Pagi | TRUE | Shift umum |
| SHF-SIANG | Shift Siang | TRUE | Shift umum |
| SHF-MALAM | Shift Malam | TRUE | Shift umum |
| SHF-OFF | Libur / OFF | TRUE | Shift umum |
| SHF-0002 | Shift Cabang | FALSE | Shift khusus |
| SHF-0003 | Security Shift Pagi | FALSE | Shift khusus |
| SHF-0004 | Security Shift Siang | FALSE | Shift khusus |
| SHF-0005 | Security Shift Malam | FALSE | Shift khusus |
| SHF-0006 | Shift Mobile/Lapangan | FALSE | Shift khusus |

---

## 🔍 Analisis Penggunaan di Code

### ✅ Di Model Sequelize
**File:** `src/models/master/shiftKerja.model.js`

**Status:** ❌ **TIDAK ADA**

Model `ShiftKerja` **TIDAK** mendefinisikan field `is_umum`. Field yang ada:
- id
- nama
- jam_masuk
- jam_pulang
- durasi_istirahat
- hari_kerja
- toleransi_keterlambatan
- keterangan
- **is_hari_kerja** (field baru yang kita tambahkan)
- is_active
- created_at
- updated_at

### ✅ Di Services/Controllers/Repositories
**Status:** ❌ **TIDAK DITEMUKAN**

Grep search untuk `is_umum` di seluruh codebase **TIDAK** menemukan penggunaan apapun kecuali di script analisis.

### ✅ Di Migrations/Scripts
**Status:** ❌ **TIDAK DITEMUKAN**

Tidak ada migration atau script yang menggunakan kolom `is_umum`.

---

## 💡 Kesimpulan

### 🔴 Kolom `is_umum` adalah **ORPHAN COLUMN**

**Evidence:**
1. ✅ Kolom **ADA** di database
2. ✅ Kolom **MEMILIKI DATA** (TRUE/FALSE)
3. ❌ Kolom **TIDAK DIDEFINISIKAN** di model Sequelize
4. ❌ Kolom **TIDAK DIGUNAKAN** di business logic apapun
5. ❌ Kolom **TIDAK DIAKSES** di services/controllers/repositories

### 🤔 Kemungkinan Penyebab

**Skenario 1: Legacy Column**
- Kolom dibuat di awal development
- Sempat digunakan untuk membedakan shift umum vs khusus
- Seiring waktu, logic berubah dan kolom tidak digunakan lagi
- **Tapi data masih diisi** (mungkin di aplikasi lain atau manual)

**Skenario 2: Planned Feature**
- Kolom dibuat untuk fitur yang direncanakan
- Fitur belum diimplementasi di backend
- Data sudah diisi (mungkin ada di frontend/aplikasi lain)

**Skenario 3: External System**
- Kolom digunakan oleh sistem eksternal
- Backend Node.js tidak menggunakannya
- Tapi sistem lain (misal: reporting, dashboard) mungkin pakai

---

## ⚠️ Dampak Jika Dihapus

### Aman untuk Dihapus JIka:
1. ✅ Tidak ada sistem eksternal yang depend pada kolom ini
2. ✅ Tidak ada frontend yang membaca/menulis kolom ini
3. ✅ Tidak ada reporting/dashboard yang pakai
4. ✅ Data TRUE/FALSE tidak memiliki makna bisnis yang penting

### Bermasalah Jika:
1. ❌ Ada aplikasi lain (frontend/mobile) yang menggunakan
2. ❌ Ada reporting yang filter berdasarkan is_umum
3. ❌ Ada business rule yang tergantung kolom ini
4. ❌ Ada rencana fitur yang akan menggunakan kolom ini

---

## 📋 Rekomendasi

### Opsi 1: **HAPUS** Kolom (Recommended)

**Jika:**
- Tidak ada sistem lain yang pakai
- Data TRUE/FALSE tidak penting
- Ingin clean up database schema

**Langkah:**
```sql
-- Migration untuk hapus kolom is_umum
ALTER TABLE absensi.m_shift_kerja DROP COLUMN IF EXISTS is_umum;
```

**Keuntungan:**
- ✅ Schema lebih clean
- ✅ Tidak ada confusion
- ✅ Maintenance lebih mudah

**Risk:**
- ⚠️ Jika ada sistem lain yang pakai, akan error

---

### Opsi 2: **TAMBAHKAN ke Model** (Alternative)

**Jika:**
- Ada kemungkinan akan digunakan
- Ingin preserve data existing
- Ragu apakah ada sistem lain yang pakai

**Langkah:**
```javascript
// src/models/master/shiftKerja.model.js
is_umum: {
  type: DataTypes.BOOLEAN,
  allowNull: true,
  defaultValue: true,
  comment: 'Flag shift umum (TRUE) vs shift khusus/custom (FALSE)',
},
```

**Keuntungan:**
- ✅ Konsisten dengan database
- ✅ Data tetap accessible via Sequelize
- ✅ Siap jika nanti digunakan

**Kekurangan:**
- ❌ Tetap ada kolom yang tidak digunakan
- ❌ Maintenance overhead

---

### Opsi 3: **INVESTIGASI LEBIH LANJUT** (Safest)

**Action Items:**
1. Cek **frontend/mobile app** - apakah ada yang baca/tulis `is_umum`?
2. Cek **reporting/dashboard** - apakah ada query yang filter by `is_umum`?
3. Tanya **product owner/business** - apakah `is_umum` penting?
4. Cek **dokumentasi lama** - apakah ada spec tentang `is_umum`?

**Setelah investigasi:**
- Jika tidak ada yang pakai → **Hapus**
- Jika ada yang pakai → **Tambah ke model + implement logic**
- Jika ragu → **Biarkan sementara, tandai sebagai deprecated**

---

## 🎯 Rekomendasi Final

### **PILIHAN 1: HAPUS** (80% Confidence)

**Alasan:**
1. Tidak ada di model Sequelize → Backend tidak pakai
2. Tidak ada di business logic → Tidak ada fungsi
3. Pattern data jelas (TRUE vs FALSE) tapi tidak digunakan
4. Mirip dengan `is_active` yang sudah ada dan ter-defined

**Action:**
```bash
# 1. Buat migration
cat > migrations/drop_is_umum_column.sql << 'EOF'
-- Drop kolom is_umum yang tidak digunakan
ALTER TABLE absensi.m_shift_kerja DROP COLUMN IF EXISTS is_umum;
EOF

# 2. Run migration
node src/scripts/runMigration.script.js migrations/drop_is_umum_column.sql
```

### **PILIHAN 2: INVESTIGASI DULU** (Safe)

**Action:**
1. Cek dengan tim frontend/mobile
2. Cek dengan tim reporting
3. Tanya product owner
4. **Setelah confirm tidak ada yang pakai** → Baru hapus

---

## 📊 Comparison: is_umum vs is_hari_kerja

| Aspek | is_umum | is_hari_kerja (Baru) |
|-------|---------|----------------------|
| **Defined di Model** | ❌ Tidak | ✅ Ya |
| **Digunakan di Logic** | ❌ Tidak | ✅ Ya (Rekonsiliasi) |
| **Ada Data** | ✅ Ya | ✅ Ya |
| **Business Purpose** | ❓ Tidak jelas | ✅ Jelas (skip shift OFF) |
| **Status** | 🔴 Orphan | ✅ Active |

---

## 🚀 Implementation Script

Jika memutuskan untuk **HAPUS**:

```sql
-- migrations/drop_is_umum_column.sql
-- ================================================================
-- Drop kolom is_umum yang tidak digunakan di m_shift_kerja
-- Date: 2025-11-17
-- Reason: Orphan column - tidak didefinisikan di model Sequelize
--         dan tidak digunakan di business logic apapun
-- ================================================================

-- Backup data dulu (optional)
CREATE TABLE IF NOT EXISTS backup.m_shift_kerja_is_umum_backup AS
SELECT id, nama, is_umum, created_at
FROM absensi.m_shift_kerja;

-- Drop kolom
ALTER TABLE absensi.m_shift_kerja DROP COLUMN IF EXISTS is_umum;

-- Log
DO $$
BEGIN
  RAISE NOTICE '✅ Kolom is_umum berhasil dihapus dari m_shift_kerja';
  RAISE NOTICE 'ℹ️  Backup data tersimpan di: backup.m_shift_kerja_is_umum_backup';
END $$;
```

---

**Last Updated:** 2025-11-17
**Analyzed By:** Claude Code
**Confidence Level:** High (80%)
**Recommendation:** **DELETE** after confirming with frontend/reporting teams
