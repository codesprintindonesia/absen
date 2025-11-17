# 📅 Cron Jobs Guide - Database-Driven System

## Overview

Sistem cron job sepenuhnya **database-driven** dan **auto-loading**. Tidak perlu update code atau migration setiap kali menambah job baru.

## Architecture

```
┌─────────────────┐
│   Database      │  ← Single Source of Truth
│  (PostgreSQL)   │     Konfigurasi semua cron jobs
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Scheduler     │  ← Auto-load executors dari folder
│ (Node.js App)   │     Start/stop jobs berdasarkan DB
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Job Executors  │  ← File .job.js di src/schedulers/jobs/
│   (*.job.js)    │     Berisi logic bisnis sebenarnya
└─────────────────┘
```

---

## 🚀 Menambah Cron Job Baru

### Step 1: Buat Job Executor

**File**: `src/schedulers/jobs/namaJob.job.js`

```javascript
// src/schedulers/jobs/backupDatabase.job.js

// Metadata untuk dynamic loading (WAJIB)
export const JOB_TYPE = "BACKUP_DATABASE";

/**
 * Execute backup database
 * @param {Object} params - Job parameters dari database
 */
export const jalankanBackupDatabase = async (params = {}) => {
  console.log("🔄 Starting database backup...");

  // Your business logic here
  const backupPath = params.backupPath || "/backup";
  // ... backup logic ...

  console.log("✅ Backup completed");
};

export default jalankanBackupDatabase;
```

**Naming Convention:**
- **Filename**: `camelCase.job.js` (e.g., `backupDatabase.job.js`)
- **Export Function**: `jalankan + PascalCase` (e.g., `jalankanBackupDatabase`)
- **JOB_TYPE**: `SNAKE_UPPER_CASE` (e.g., `BACKUP_DATABASE`)

### Step 2: Insert ke Database

**Option A - Via API** (Recommended):

```bash
curl -X POST http://localhost:3000/api/cron-jobs \
  -H "Content-Type: application/json" \
  -d '{
    "id": "CRON-BACKUP-DB",
    "job_name": "Backup Database Daily",
    "job_type": "BACKUP_DATABASE",
    "cron_expression": "0 0 3 * * *",
    "is_enabled": true,
    "status": "ENABLED",
    "config_params": {
      "backupPath": "/var/backups"
    },
    "description": "Backup database setiap hari jam 03:00",
    "timezone": "Asia/Makassar"
  }'
```

**Option B - Via SQL**:

```sql
INSERT INTO absensi.s_cron_job_config (
  id, job_name, job_type, cron_expression,
  is_enabled, status, config_params, description, timezone,
  created_by, updated_by, created_at, updated_at
) VALUES (
  'CRON-BACKUP-DB',
  'Backup Database Daily',
  'BACKUP_DATABASE',
  '0 0 3 * * *',
  true,
  'ENABLED',
  '{"backupPath": "/var/backups"}'::jsonb,
  'Backup database setiap hari jam 03:00',
  'Asia/Makassar',
  'ADMIN',
  'ADMIN',
  NOW(),
  NOW()
);
```

### Step 3: Reload Scheduler

**Option A - Restart Aplikasi**:
```bash
npm start
# atau
pm2 restart absensi
```

**Option B - Hot Reload via API**:
```bash
curl -X POST http://localhost:3000/api/cron-jobs/reload
```

---

## ⚙️ Cron Expression Format

Format: **6 fields** (detik menit jam hari bulan hari-minggu)

```
┌───────── detik (0-59)
│ ┌─────── menit (0-59)
│ │ ┌───── jam (0-23)
│ │ │ ┌─── hari (1-31)
│ │ │ │ ┌─ bulan (1-12)
│ │ │ │ │ ┌ hari minggu (0-7, 0/7=Minggu)
│ │ │ │ │ │
* * * * * *
```

**Contoh:**
- `0 0 2 * * *` - Setiap hari jam 02:00:00
- `0 */30 * * * *` - Setiap 30 menit
- `*/10 * * * * *` - Setiap 10 detik
- `0 0 1 1 * *` - Setiap tanggal 1 jam 01:00
- `0 0 9 * * 1-5` - Setiap hari kerja jam 09:00

**Tools**: https://crontab.guru/ (convert dari 5 field ke 6 field dengan tambah detik di depan)

---

## 📡 API Endpoints

### List All Cron Jobs
```bash
GET /api/cron-jobs
```

### Get Single Cron Job
```bash
GET /api/cron-jobs/:id
```

### Create New Cron Job
```bash
POST /api/cron-jobs
Content-Type: application/json

{
  "id": "CRON-XXX",
  "job_name": "Job Name",
  "job_type": "JOB_TYPE",
  "cron_expression": "0 0 2 * * *",
  "is_enabled": true,
  "config_params": {},
  "description": "...",
  "timezone": "Asia/Makassar"
}
```

### Update Cron Job
```bash
PUT /api/cron-jobs/:id
Content-Type: application/json

{
  "cron_expression": "0 0 3 * * *",
  "is_enabled": false
}
```

### Enable/Disable Job
```bash
POST /api/cron-jobs/:id/enable
POST /api/cron-jobs/:id/disable
```

### Reload All Jobs
```bash
POST /api/cron-jobs/reload
```

### Get Scheduler Status
```bash
GET /api/cron-jobs/status
```

---

## 🔍 Troubleshooting

### Job tidak jalan?

**1. Cek executor sudah ter-load:**
```bash
curl http://localhost:3000/api/cron-jobs/status
```

Lihat di `registered_executors`, pastikan JOB_TYPE Anda ada di list.

**2. Cek job enabled:**
```bash
curl http://localhost:3000/api/cron-jobs/CRON-XXX
```

Pastikan `is_enabled: true` dan `status: "ENABLED"`.

**3. Cek logs aplikasi:**
```bash
# Saat startup, harus ada:
📦 Loading job executors...
   ✅ Loaded: backupDatabase.job.js → BACKUP_DATABASE

📊 Total executors loaded: 5
   Available job types: TEST_CRON, REKONSILIASI_HARIAN, ...
```

**4. Validasi cron expression:**
```javascript
// Di aplikasi
import { isValidCronExpression } from './schedulers/centralizedCron.scheduler.js';
console.log(isValidCronExpression("0 0 2 * * *")); // true/false
```

### Job executor tidak ter-load?

**Cek naming convention:**
- File: `backupDatabase.job.js` ✅
- Export: `jalankanBackupDatabase` ✅
- JOB_TYPE: `export const JOB_TYPE = "BACKUP_DATABASE"` ✅

**Salah:**
- File: `backup-database.job.js` ❌ (gunakan camelCase, bukan kebab-case)
- Export: `backupDatabase` ❌ (harus ada prefix `jalankan`)
- Tidak export JOB_TYPE ❌

---

## 📁 Struktur File

```
src/
├── schedulers/
│   ├── centralizedCron.scheduler.js  ← Main scheduler (auto-load executors)
│   └── jobs/                         ← Executor files
│       ├── testCron.job.js
│       ├── rekonsiliasi.job.js
│       ├── generateLemburBulanan.job.js
│       ├── generateShiftBulanan.job.js
│       └── backupDatabase.job.js     ← Your new job
│
├── models/system/
│   └── cronJobConfig.model.js        ← Database model
│
└── routes/
    └── cronJobs.route.js             ← API endpoints

migrations/
├── create_cron_job_config_table.sql  ← Initial table
└── remove_cron_job_type_constraint.sql ← Remove constraint
```

---

## ✅ Best Practices

### 1. **Job Executor harus Idempotent**
```javascript
// BAD: akan error jika dijalankan 2x
export const jalankanBackup = async () => {
  await fs.mkdir("/backup/2024-01-01"); // Error if exists
};

// GOOD: idempotent
export const jalankanBackup = async () => {
  await fs.mkdir("/backup/2024-01-01", { recursive: true });
};
```

### 2. **Handle Error dengan Baik**
```javascript
export const jalankanMyJob = async (params) => {
  try {
    // Your logic
  } catch (error) {
    console.error("❌ Job failed:", error.message);
    // Error akan tersimpan di database (last_error column)
    throw error; // Re-throw untuk logging
  }
};
```

### 3. **Gunakan Parameters dari Database**
```javascript
export const jalankanBackup = async (params = {}) => {
  const path = params.backupPath || "/default/backup";
  const retention = params.retentionDays || 7;

  // Use params...
};
```

### 4. **Log Progress dengan Jelas**
```javascript
export const jalankanLongJob = async (params) => {
  console.log("📝 Starting long job...");

  console.log("  Step 1/3: Processing...");
  // ...

  console.log("  Step 2/3: Uploading...");
  // ...

  console.log("  Step 3/3: Cleanup...");
  // ...

  console.log("✅ Long job completed");
};
```

---

## 🎯 Migration Notes

### Dari Sistem Lama ke Database-Driven:

**Tidak Perlu Lagi:**
- ❌ Update `CRON_JOB_TYPES` enum di model
- ❌ Buat migration untuk update constraint
- ❌ Update import di scheduler
- ❌ Hardcode job list di code

**Cukup:**
- ✅ Buat file `.job.js`
- ✅ Insert ke database
- ✅ Restart app

---

## 📞 Support

Jika ada masalah:
1. Cek logs aplikasi
2. Cek API `/api/cron-jobs/status`
3. Validasi cron expression
4. Pastikan naming convention benar
