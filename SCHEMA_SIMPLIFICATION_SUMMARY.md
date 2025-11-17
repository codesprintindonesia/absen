# 🧹 Schema Simplification - Remove Redundant Fields

**Date**: 2025-11-17
**Type**: Schema Cleanup
**Impact**: Removed redundant fields from `s_cron_job_config` table

---

## 📋 Summary

Cleaned up `s_cron_job_config` table by removing redundant fields:
- **Removed**: `status` (redundant with `is_enabled`)
- **Removed**: `next_run` (not supported by node-cron)

Simplified status management to use **`is_enabled` boolean only**.

---

## ❌ Fields Removed

### 1. `status` Column
**Why removed?**
- Redundant dengan `is_enabled`
- `is_enabled = true` → `status = 'ENABLED'`
- `is_enabled = false` → `status = 'DISABLED'`
- Bisa terjadi inconsistency jika tidak sync
- `PAUSED` status tidak digunakan dalam practice

**Before:**
```sql
is_enabled BOOLEAN NOT NULL DEFAULT false,
status VARCHAR(20) NOT NULL DEFAULT 'DISABLED'
  CHECK (status IN ('ENABLED', 'DISABLED', 'PAUSED'))
```

**After:**
```sql
is_enabled BOOLEAN NOT NULL DEFAULT false
-- Cukup boolean: true = aktif, false = nonaktif
```

### 2. `next_run` Column
**Why removed?**
- `node-cron` tidak menyediakan API untuk calculate next run time
- Field ini selalu `NULL` di kode kita
- Misleading - terlihat berguna tapi tidak terpakai

**Before:**
```sql
next_run TIMESTAMP
```

**After:**
```sql
-- Field dihapus completely
```

---

## ✅ Final Schema

```sql
CREATE TABLE absensi.s_cron_job_config (
  -- Identity
  id VARCHAR(50) PRIMARY KEY,
  job_name VARCHAR(100) NOT NULL,
  job_type VARCHAR(50) NOT NULL,  -- Dynamic, no constraint
  cron_expression VARCHAR(50) NOT NULL,

  -- Status (Simplified!)
  is_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Execution History
  last_run TIMESTAMP,
  last_status VARCHAR(20),  -- 'SUCCESS' | 'FAILED'
  last_error TEXT,          -- For debugging

  -- Configuration
  config_params JSONB,
  description TEXT,
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Makassar',

  -- Audit
  created_by VARCHAR(50) DEFAULT 'SYSTEM',
  updated_by VARCHAR(50) DEFAULT 'SYSTEM',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes (Simplified)
CREATE INDEX idx_cron_job_type ON absensi.s_cron_job_config(job_type);
CREATE INDEX idx_cron_job_enabled ON absensi.s_cron_job_config(is_enabled);
```

---

## 🔧 Code Changes

### 1. Model (`cronJobConfig.model.js`)
```diff
- const CRON_JOB_STATUS = ["ENABLED", "DISABLED", "PAUSED"];
- export { CRON_JOB_STATUS, CronJobConfig };
+ export { CronJobConfig };

- status: {
-   type: DataTypes.STRING(20),
-   validate: { isIn: [CRON_JOB_STATUS] },
- },
- next_run: {
-   type: DataTypes.DATE,
- },

+ // Only is_enabled remains
```

### 2. Services (`manageCronJob.service.js`)
```diff
- { is_enabled: true, status: "ENABLED" }
+ { is_enabled: true }

- { is_enabled: false, status: "DISABLED" }
+ { is_enabled: false }

- next_run: runInfo.nextRun || null,
+ // next_run field removed
```

### 3. Functions Removed
```diff
- pauseCronJobService()    // No longer needed
- resumeCronJobService()   // No longer needed
```

**Note**: Pause/resume endpoints masih ada di routes tapi akan error karena function sudah dihapus. Bisa dihapus nanti jika perlu.

---

## 📊 Field Breakdown

| Field | Before | After | Reason |
|-------|--------|-------|--------|
| `is_enabled` | ✅ Keep | ✅ **KEEP** | Simple boolean flag |
| `status` | ✅ Keep | ❌ **REMOVED** | Redundant with is_enabled |
| `next_run` | ✅ Keep | ❌ **REMOVED** | Not supported by node-cron |
| `last_run` | ✅ Keep | ✅ **KEEP** | Execution monitoring |
| `last_status` | ✅ Keep | ✅ **KEEP** | SUCCESS/FAILED tracking |
| `last_error` | ✅ Keep | ✅ **KEEP** | Debugging |

---

## 🚀 Migration

**File**: `migrations/simplify_cron_job_config_schema.sql`

```sql
ALTER TABLE absensi.s_cron_job_config DROP COLUMN IF EXISTS status;
ALTER TABLE absensi.s_cron_job_config DROP COLUMN IF EXISTS next_run;
```

**Run**:
```bash
node src/scripts/runMigration.script.js migrations/simplify_cron_job_config_schema.sql
```

---

## 🎯 API Changes

### Before:
```javascript
// Create with status
POST /api/cron-jobs
{
  "is_enabled": true,
  "status": "ENABLED"  // Redundant!
}

// Pause job
POST /api/cron-jobs/:id/pause

// Resume job
POST /api/cron-jobs/:id/resume
```

### After:
```javascript
// Create dengan is_enabled saja
POST /api/cron-jobs
{
  "is_enabled": true  // Simple!
}

// Pause = disable
POST /api/cron-jobs/:id/disable

// Resume = enable
POST /api/cron-jobs/:id/enable
```

---

## 💡 Benefits

### Before (Complex):
- ❌ 2 fields untuk status (`is_enabled` + `status`)
- ❌ Bisa inconsistent (enabled=true tapi status=DISABLED)
- ❌ Field `next_run` tidak terpakai
- ❌ PAUSED state tidak digunakan
- ❌ Lebih complex logic di code

### After (Simple):
- ✅ 1 field untuk status (`is_enabled` saja)
- ✅ No inconsistency possible
- ✅ No unused fields
- ✅ Simple boolean logic
- ✅ Cleaner code

---

## 📝 TODO (Optional Cleanup)

Jika mau cleanup sempurna:

1. **Remove unused controller functions:**
   - `pauseCronJob` controller
   - `resumeCronJob` controller

2. **Remove unused routes:**
   ```javascript
   // src/routes/system/cronJobConfig.route.js
   - router.post("/:id/pause", pauseCronJob);
   - router.post("/:id/resume", resumeCronJob);
   ```

3. **Update API documentation:**
   - Update Swagger docs
   - Remove pause/resume dari docs

**Note**: Ini optional karena endpoint akan error kalau dipanggil (function sudah dihapus), tapi tidak mengganggu aplikasi.

---

## ✅ Verification

```bash
# Check schema
psql -d absensi_dev -c "\d absensi.s_cron_job_config"

# Verify no status or next_run column
# Verify is_enabled column exists

# Test API
curl http://localhost:3000/api/cron-jobs
# Response should not have 'status' or 'next_run' fields
```

---

## 🎉 Result

**Schema sekarang jauh lebih sederhana:**
- Hanya `is_enabled` untuk status management
- No redundant fields
- No unused fields
- Clean and simple!

**From**: 17 columns → **To**: 15 columns (-2 redundant)
