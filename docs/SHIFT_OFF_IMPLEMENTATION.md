# Implementasi Shift OFF/Libur untuk Rotating Shift Pattern

**Tanggal:** 2025-11-17
**Versi:** 1.0
**Status:** ✅ Implemented

## 📋 Ringkasan

Implementasi fitur untuk mendukung shift OFF/Libur dalam rotating shift pattern (contoh: P-P-S-S-M-M-OFF) dengan memastikan bahwa shift libur **tidak diproses** dalam rekonsiliasi absensi.

## 🎯 Tujuan

1. **Support rotating shift** dengan hari libur (contoh: Security shift 6 kerja + 1 libur)
2. **Skip rekonsiliasi** untuk pegawai yang sedang shift OFF/Libur
3. **Maintain data integrity** - pegawai libur tidak masuk ke `t_absensi_harian`
4. **Fleksibel** - bisa dikontrol via flag `is_hari_kerja`

## 🔧 Perubahan yang Dilakukan

### 1. Database Schema

**File:** `migrations/add_is_hari_kerja_to_shift_kerja.sql`

```sql
ALTER TABLE absensi.m_shift_kerja
ADD COLUMN is_hari_kerja BOOLEAN DEFAULT TRUE NOT NULL;
```

**Field baru:**
- `is_hari_kerja`: Flag untuk menandai apakah shift adalah hari kerja (TRUE) atau libur (FALSE)

### 2. Model Update

**File:** `src/models/master/shiftKerja.model.js`

**Perubahan:**
```javascript
is_hari_kerja: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: true,
  comment: 'Flag untuk menandai apakah shift ini adalah hari kerja (TRUE) atau libur/off (FALSE)',
}
```

### 3. Repository Update

**File:** `src/repositories/transactional/absensiHarian/rekonsiliasi.repository.js`

**Perubahan di `getShiftHarianByDate`:**
```javascript
{
  model: ShiftKerja,
  as: 'shiftKerja',
  required: true,
  where: {
    is_hari_kerja: true  // FILTER: Hanya shift hari kerja
  },
  attributes: [
    // ... existing attributes
    'is_hari_kerja'
  ]
}
```

**Impact:**
- Shift dengan `is_hari_kerja = FALSE` akan di-skip dari proses rekonsiliasi
- Pegawai yang shift OFF tidak akan muncul di `t_absensi_harian`

## 📦 Backup Files

Backup disimpan di: `backup/shift-off-implementation-20251117-031800/`

Files:
- `shiftKerja.model.js`
- `rekonsiliasi.repository.js`

## 🚀 Cara Menggunakan

### Step 1: Run Migration

```bash
node src/scripts/runMigration.script.js migrations/add_is_hari_kerja_to_shift_kerja.sql
```

### Step 2: Setup Shift Security

```bash
node src/scripts/runMigration.script.js migrations/setup_shift_security_rotating.sql
```

### Step 3: Assign Pegawai ke Shift Group

Edit file `migrations/setup_shift_security_rotating.sql` bagian STEP 4:
- Uncomment kode assignment
- Ganti `PEG-SEC001`, `PEG-SEC002`, dll dengan ID pegawai sebenarnya
- Run ulang migration

**Atau assign via API:**

```javascript
POST /api/shift-pegawai
{
  "id_pegawai": "PEG-SEC001",
  "id_shift_group": "SG-SECUR",
  "offset_rotasi_hari": 0,
  "tanggal_mulai": "2025-01-01",
  "is_active": true
}
```

### Step 4: Generate Shift Harian

```bash
# Manual via API/Controller
POST /api/shift-harian-pegawai/generate
{
  "tanggalMulai": "2025-01-01",
  "tanggalAkhir": "2025-01-31",
  "mode": "skip"
}

# Otomatis via Cron (bulan depan)
# Sudah terjadwal di cronJobs.config.js
```

### Step 5: Verifikasi

```sql
-- Cek pattern shift yang di-generate
SELECT
  tanggal_kerja,
  id_pegawai,
  nama_pegawai,
  id_shift_kerja_aktual,
  sk.nama as nama_shift,
  sk.is_hari_kerja
FROM absensi.t_shift_harian_pegawai shp
JOIN absensi.m_shift_kerja sk ON sk.id = shp.id_shift_kerja_aktual
WHERE id_pegawai IN ('PEG-SEC001', 'PEG-SEC002', 'PEG-SEC003')
  AND tanggal_kerja BETWEEN '2025-01-01' AND '2025-01-14'
ORDER BY tanggal_kerja, id_pegawai;

-- Expected result: Akan ada shift OFF di t_shift_harian_pegawai
-- tapi saat rekonsiliasi, shift OFF akan di-skip
```

## 📊 Pattern yang Di-support

### Security Rotation (P-P-S-S-M-M-OFF)

| Hari | Urutan Siklus | Shift      | is_hari_kerja |
|------|---------------|------------|---------------|
| 1    | 1             | SHIFT-PAGI | TRUE          |
| 2    | 2             | SHIFT-PAGI | TRUE          |
| 3    | 3             | SHIFT-SIANG| TRUE          |
| 4    | 4             | SHIFT-SIANG| TRUE          |
| 5    | 5             | SHIFT-MALAM| TRUE          |
| 6    | 6             | SHIFT-MALAM| TRUE          |
| 7    | 7             | SHIFT-OFF  | **FALSE**     |

### Offset untuk Coverage 24 Jam

Untuk 3 security agar selalu ada coverage:

| Security | Offset | Starting Shift | Pattern          |
|----------|--------|----------------|------------------|
| SEC-001  | 0      | PAGI           | P-P-S-S-M-M-OFF  |
| SEC-002  | 2      | SIANG          | S-S-M-M-OFF-P-P  |
| SEC-003  | 4      | MALAM          | M-M-OFF-P-P-S-S  |

**Result:** Setiap hari ada minimal 2 security yang bekerja (kadang 3, kadang 2 karena libur)

## 🔍 Testing

### Test 1: Generate Shift

```javascript
// Test generate untuk 1 pegawai, 14 hari
const result = await generateShiftHarianPegawaiService({
  tanggalMulai: '2025-01-01',
  tanggalAkhir: '2025-01-14',
  idPegawai: 'PEG-SEC001',
  mode: 'overwrite'
});

console.log(result.data);
// Expected: totalGenerated = 14 (termasuk 2 hari OFF)
```

### Test 2: Rekonsiliasi

```javascript
// Tanggal dimana pegawai shift OFF
await prosesRekonsiliasi('2025-01-07');

// Check hasil
const absensi = await AbsensiHarian.findAll({
  where: {
    tanggal_absensi: '2025-01-07',
    id_pegawai: 'PEG-SEC001'
  }
});

console.log(absensi.length);
// Expected: 0 (tidak ada data karena shift OFF di-skip)
```

### Test 3: Cycle Pattern

Jalankan test script:
```bash
node test-cycle-pattern.js
```

Expected output:
- Pattern berulang setiap 7 hari ✅
- Offset berbeda menghasilkan starting position berbeda ✅
- Coverage 24 jam dengan 3 security ✅

## ⚠️ Important Notes

### 1. Shift OFF di t_shift_harian_pegawai

✅ **AKAN ADA** data shift OFF di `t_shift_harian_pegawai`
- Ini normal dan sesuai design
- Berguna untuk tracking jadwal lengkap pegawai

❌ **TIDAK AKAN ADA** data shift OFF di `t_absensi_harian`
- Karena di-skip saat rekonsiliasi
- Pegawai libur tidak perlu absensi

### 2. Lembur di Hari Libur

Jika pegawai masuk saat shift OFF:
- Data **TIDAK** akan masuk ke absensi otomatis
- Harus manual entry atau fitur terpisah untuk "lembur hari libur"

**Future Enhancement:** Buat proses khusus untuk detect & process lembur hari libur

### 3. Perubahan Shift Group

Jika ingin ubah pattern (misal: P-P-P-S-S-M-OFF):
1. Update `durasi_rotasi_hari` di `m_shift_group`
2. Hapus semua detail lama
3. Insert detail baru sesuai pattern baru
4. Re-generate shift harian untuk periode yang terpengaruh

### 4. Validasi Data

Sistem akan validasi:
```javascript
// Di generate.service.js:180-184
if (shiftPattern.length !== cycleLength) {
  throw new Error(
    `Pattern tidak lengkap. Expected ${cycleLength} detail, got ${shiftPattern.length}`
  );
}
```

Pastikan jumlah `r_shift_group_detail` = `durasi_rotasi_hari`

## 🔄 Rollback Plan

Jika perlu rollback:

### 1. Restore Files
```bash
cp backup/shift-off-implementation-20251117-031800/shiftKerja.model.js src/models/master/
cp backup/shift-off-implementation-20251117-031800/rekonsiliasi.repository.js src/repositories/transactional/absensiHarian/
```

### 2. Rollback Database (Optional)
```sql
-- Jika ingin hapus field is_hari_kerja (HATI-HATI!)
ALTER TABLE absensi.m_shift_kerja DROP COLUMN IF EXISTS is_hari_kerja;
DROP INDEX IF EXISTS absensi.idx_shift_kerja_is_hari_kerja;
```

### 3. Restart Application
```bash
# Restart untuk reload model
```

## 📚 Related Files

### Modified
- `src/models/master/shiftKerja.model.js`
- `src/repositories/transactional/absensiHarian/rekonsiliasi.repository.js`

### New
- `migrations/add_is_hari_kerja_to_shift_kerja.sql`
- `migrations/setup_shift_security_rotating.sql`
- `docs/SHIFT_OFF_IMPLEMENTATION.md`
- `test-cycle-pattern.js`

### Unchanged (Still Works)
- `src/services/transactional/shiftHarianPegawai/generate.service.js`
- `src/services/transactional/absensiHarian/rekonsiliasi.service.js`
- `src/schedulers/jobs/generateShiftBulanan.job.js`
- `src/schedulers/jobs/rekonsiliasi.job.js`

## ✅ Checklist Implementasi

- [x] Buat migration script untuk `is_hari_kerja`
- [x] Update model `ShiftKerja`
- [x] Update repository rekonsiliasi
- [x] Buat SQL setup untuk shift security
- [x] Buat test script untuk verifikasi pattern
- [x] Buat dokumentasi lengkap
- [x] Backup files sebelum modify
- [ ] Run migration di database production (TODO: USER)
- [ ] Test dengan data real pegawai (TODO: USER)
- [ ] Monitor hasil rekonsiliasi (TODO: USER)

## 🎓 FAQ

**Q: Apakah shift OFF tetap masuk ke t_shift_harian_pegawai?**
A: Ya, tetap masuk. Ini untuk tracking jadwal lengkap. Tapi tidak akan masuk ke t_absensi_harian.

**Q: Bagaimana jika pegawai libur tapi masuk kerja (lembur)?**
A: Saat ini tidak terdeteksi otomatis. Perlu manual entry atau fitur terpisah untuk lembur hari libur.

**Q: Apakah bisa pola selain P-P-S-S-M-M-OFF?**
A: Ya, bisa custom. Tinggal ubah setup di `r_shift_group_detail` dan sesuaikan `durasi_rotasi_hari`.

**Q: Apakah existing shift akan terpengaruh?**
A: Tidak. Field `is_hari_kerja` default TRUE untuk semua shift existing.

**Q: Bagaimana cara rollback jika ada masalah?**
A: Restore dari backup folder dan optionally rollback database schema.

## 📞 Support

Jika ada masalah atau pertanyaan:
1. Check log error di console
2. Verifikasi data dengan SQL query di atas
3. Review file backup sebelum restore
4. Konsultasi dengan development team

---

**Generated by:** Claude Code
**Last Updated:** 2025-11-17
