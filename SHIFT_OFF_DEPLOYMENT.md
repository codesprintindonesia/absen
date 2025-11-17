# 🚀 Deployment Guide: Shift OFF Implementation

## 📦 Files Yang Dimodifikasi

### ✅ Backup Created
Location: `backup/shift-off-implementation-20251117-031800/`

| File | Status | Backup |
|------|--------|--------|
| `src/models/master/shiftKerja.model.js` | Modified | ✅ |
| `src/repositories/transactional/absensiHarian/rekonsiliasi.repository.js` | Modified | ✅ |

### 📄 Files Baru

| File | Purpose |
|------|---------|
| `migrations/add_is_hari_kerja_to_shift_kerja.sql` | Add field `is_hari_kerja` to m_shift_kerja |
| `migrations/setup_shift_security_rotating.sql` | Setup shift pattern P-P-S-S-M-M-OFF |
| `docs/SHIFT_OFF_IMPLEMENTATION.md` | Dokumentasi lengkap |
| `test-cycle-pattern.js` | Test script untuk verifikasi pattern |
| `SHIFT_OFF_DEPLOYMENT.md` | Deployment guide (this file) |

## 🎯 Quick Deployment Steps

### 1. Pre-Deployment Check

```bash
# Pastikan backup sudah ada
ls -lh backup/shift-off-implementation-20251117-031800/

# Pastikan migration files ada
ls -lh migrations/add_is_hari_kerja_to_shift_kerja.sql
ls -lh migrations/setup_shift_security_rotating.sql
```

### 2. Run Migration - Add is_hari_kerja Field

```bash
node src/scripts/runMigration.script.js migrations/add_is_hari_kerja_to_shift_kerja.sql
```

**Expected Output:**
```
🔄 Running migration: migrations/add_is_hari_kerja_to_shift_kerja.sql

✅ Migration completed successfully!
   - Added field: is_hari_kerja (BOOLEAN, NOT NULL, DEFAULT TRUE)
   - Updated existing records to TRUE
   - Created index: idx_shift_kerja_is_hari_kerja
```

### 3. Run Migration - Setup Shift Security

```bash
node src/scripts/runMigration.script.js migrations/setup_shift_security_rotating.sql
```

**Expected Output:**
```
✅ Setup Shift Security Rotating Pattern COMPLETED!

📊 SUMMARY:
   - Shift Kerja created: 4 (PAGI, SIANG, MALAM, OFF)
   - Shift Group created: 1 (SG-SECUR)
   - Shift Group Detail: 7 (7 hari pattern)

🔄 PATTERN: P-P-S-S-M-M-OFF (7 days cycle)
```

### 4. (Optional) Assign Pegawai ke Shift Group

**Option A: Edit migration file dan run ulang**
```bash
# Edit migrations/setup_shift_security_rotating.sql
# Uncomment STEP 4 dan ganti ID pegawai
# Then run:
node src/scripts/runMigration.script.js migrations/setup_shift_security_rotating.sql
```

**Option B: Manual via SQL**
```sql
INSERT INTO absensi.r_shift_pegawai
(id, id_pegawai, id_shift_group, offset_rotasi_hari, tanggal_mulai, is_active, id_personal, nama_pegawai)
VALUES
('SP-SEC001', 'YOUR-PEGAWAI-ID-1', 'SG-SECUR', 0, '2025-01-01', TRUE, 'YOUR-PERSONAL-ID-1', 'Security 1');
```

### 5. Restart Application (If Needed)

```bash
# Restart untuk reload model changes
# (Biasanya tidak perlu jika model sudah di-reload otomatis)
```

### 6. Verify Installation

```bash
# Test cycle pattern
node test-cycle-pattern.js
```

**Expected Output:**
```
✅ Formula cycle position: ((dayIndex + offset) % cycleLength) + 1
✅ Pattern 7 hari dapat digunakan untuk rotasi P-P-S-S-M-M-OFF
✅ Dengan offset berbeda, dapat coverage 24 jam setiap hari
✅ Pattern berulang otomatis setiap 7 hari
```

### 7. Verify Database

```sql
-- Check field is_hari_kerja exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'absensi'
  AND table_name = 'm_shift_kerja'
  AND column_name = 'is_hari_kerja';

-- Check shift data
SELECT id, nama, is_hari_kerja
FROM absensi.m_shift_kerja
WHERE id IN ('SHIFT-PAGI', 'SHIFT-SIANG', 'SHIFT-MALAM', 'SHIFT-OFF');

-- Check shift group
SELECT * FROM absensi.m_shift_group WHERE id = 'SG-SECUR';

-- Check shift group detail (should be 7 rows)
SELECT * FROM absensi.r_shift_group_detail WHERE id_shift_group = 'SG-SECUR' ORDER BY urutan_hari_siklus;
```

## 🧪 Testing

### Test 1: Generate Shift Harian

```javascript
// Via API atau service call
const result = await generateShiftHarianPegawaiService({
  tanggalMulai: '2025-01-01',
  tanggalAkhir: '2025-01-14',
  idPegawai: 'PEG-SEC001', // Ganti dengan ID sebenarnya
  mode: 'overwrite'
});

console.log(result.data);
// Should generate 14 days including OFF shifts
```

### Test 2: Verify Pattern in Database

```sql
SELECT
  tanggal_kerja,
  id_pegawai,
  nama_pegawai,
  id_shift_kerja_aktual,
  sk.nama as nama_shift,
  sk.is_hari_kerja
FROM absensi.t_shift_harian_pegawai shp
JOIN absensi.m_shift_kerja sk ON sk.id = shp.id_shift_kerja_aktual
WHERE id_shift_kerja_aktual IN ('SHIFT-PAGI', 'SHIFT-SIANG', 'SHIFT-MALAM', 'SHIFT-OFF')
  AND tanggal_kerja BETWEEN '2025-01-01' AND '2025-01-14'
ORDER BY id_pegawai, tanggal_kerja;
```

Expected: See repeating pattern P-P-S-S-M-M-OFF

### Test 3: Rekonsiliasi (Skip OFF Shift)

```javascript
// Pilih tanggal dimana pegawai shift OFF
await prosesRekonsiliasi('2025-01-07');

// Verify: Pegawai dengan shift OFF tidak masuk ke t_absensi_harian
const absensi = await AbsensiHarian.findAll({
  where: {
    tanggal_absensi: '2025-01-07',
    id_shift_kerja: 'SHIFT-OFF'
  }
});

console.log(absensi.length);
// Expected: 0 (shift OFF di-skip)
```

## ⚠️ Rollback Plan

### If Something Goes Wrong

```bash
# 1. Restore model file
cp backup/shift-off-implementation-20251117-031800/shiftKerja.model.js src/models/master/

# 2. Restore repository file
cp backup/shift-off-implementation-20251117-031800/rekonsiliasi.repository.js src/repositories/transactional/absensiHarian/

# 3. (Optional) Rollback database
psql -d your_database -c "ALTER TABLE absensi.m_shift_kerja DROP COLUMN IF EXISTS is_hari_kerja;"

# 4. Restart application
```

## 📊 Monitoring

### After Deployment, Monitor These:

1. **Generate Shift Job**
   - Check logs untuk job `generateShiftBulanan`
   - Verify data di `t_shift_harian_pegawai` include shift OFF

2. **Rekonsiliasi Job**
   - Check logs untuk job `rekonsiliasi`
   - Verify shift OFF **tidak** masuk ke `t_absensi_harian`
   - Check `s_proses_harian` untuk success/failure

3. **Data Integrity**
   ```sql
   -- Harus 0 (shift OFF tidak boleh masuk absensi)
   SELECT COUNT(*) FROM absensi.t_absensi_harian
   WHERE id_shift_kerja = 'SHIFT-OFF';

   -- Boleh ada (shift OFF ada di jadwal)
   SELECT COUNT(*) FROM absensi.t_shift_harian_pegawai
   WHERE id_shift_kerja_aktual = 'SHIFT-OFF';
   ```

## ✅ Success Criteria

Deployment sukses jika:

- [x] Migration run tanpa error
- [x] Field `is_hari_kerja` ada di table `m_shift_kerja`
- [x] Shift PAGI, SIANG, MALAM, OFF berhasil dibuat
- [x] Shift group SG-SECUR dengan 7 detail berhasil dibuat
- [x] Test pattern script show correct rotation
- [x] Generate shift include shift OFF di `t_shift_harian_pegawai`
- [x] Rekonsiliasi skip shift OFF (tidak masuk `t_absensi_harian`)
- [x] Aplikasi berjalan normal tanpa error

## 📞 Troubleshooting

### Error: Column is_hari_kerja does not exist

**Solution:**
```bash
# Run migration lagi
node src/scripts/runMigration.script.js migrations/add_is_hari_kerja_to_shift_kerja.sql
```

### Error: Pattern tidak lengkap

**Cause:** Jumlah detail tidak sesuai dengan `durasi_rotasi_hari`

**Solution:**
```sql
-- Check count
SELECT id_shift_group, COUNT(*) as jumlah_detail
FROM absensi.r_shift_group_detail
WHERE id_shift_group = 'SG-SECUR'
GROUP BY id_shift_group;

-- Should be 7 rows
-- If not, re-run setup migration
```

### Shift OFF Still Processed in Rekonsiliasi

**Cause:** Repository filter not applied

**Solution:**
1. Check repository code has `where: { is_hari_kerja: true }`
2. Restart application to reload code
3. Verify shift OFF has `is_hari_kerja = FALSE`

## 🎓 Additional Resources

- **Full Documentation:** [docs/SHIFT_OFF_IMPLEMENTATION.md](docs/SHIFT_OFF_IMPLEMENTATION.md)
- **Test Script:** [test-cycle-pattern.js](test-cycle-pattern.js)
- **Migration Scripts:** [migrations/](migrations/)
- **Backup Files:** [backup/shift-off-implementation-20251117-031800/](backup/shift-off-implementation-20251117-031800/)

---

**Deployment Date:** ___ (Fill when deployed)
**Deployed By:** ___ (Fill when deployed)
**Environment:** ___ (Development/Staging/Production)
**Status:** ⏳ Pending / ✅ Success / ❌ Rollback

**Notes:**
```
(Add deployment notes here)
```

---

**Generated by:** Claude Code
**Version:** 1.0
**Last Updated:** 2025-11-17
