# Sistem Cron Job dengan Dynamic Enable/Disable

## Overview

Sistem cron job yang dapat dikonfigurasi melalui database dengan kemampuan enable/disable secara dinamis tanpa restart aplikasi.

## Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Database Config                          │
│          (system.s_cron_job_config)                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │ id, job_name, job_type, cron_expression,          │     │
│  │ is_enabled, status, last_run, next_run, etc.      │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ Read Config
                            │
┌───────────────────────────┼─────────────────────────────────┐
│          Centralized Cron Scheduler                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Active Tasks Map (in-memory)                        │   │
│  │  ┌────────────────┐  ┌────────────────┐            │   │
│  │  │ CRON-REKON-001 │  │ CRON-LEMBUR-01 │            │   │
│  │  │ (Running)      │  │ (Stopped)      │            │   │
│  │  └────────────────┘  └────────────────┘            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Job Executors Map                                   │   │
│  │  ┌─────────────────────────┬──────────────────────┐ │   │
│  │  │ REKONSILIASI_HARIAN     │ jalankanRekonsiliasi │ │   │
│  │  │ GENERATE_LEMBUR_BULANAN │ jalankanGenerateLem..│ │   │
│  │  │ GENERATE_SHIFT_BULANAN  │ jalankanGenerateSh...│ │   │
│  │  └─────────────────────────┴──────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Execute Jobs
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Job Executors                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Rekonsiliasi │  │ Generate     │  │ Generate     │      │
│  │ Absensi      │  │ Lembur       │  │ Shift        │      │
│  │ Harian       │  │ Bulanan      │  │ Bulanan      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Komponen Utama

### 1. Database Model
**File:** `src/models/system/cronJobConfig.model.js`

Model untuk menyimpan konfigurasi cron job di database.

**Fields:**
- `id` (PK): Unique identifier (contoh: `CRON-REKONSILIASI-HARIAN`)
- `job_name`: Nama job yang human-readable
- `job_type`: Tipe job (REKONSILIASI_HARIAN, GENERATE_LEMBUR_BULANAN, dll)
- `cron_expression`: Cron expression (contoh: `0 2 * * *`)
- `is_enabled`: Boolean flag untuk enable/disable
- `status`: ENABLED | DISABLED | PAUSED
- `last_run`: Waktu terakhir job dijalankan
- `last_status`: Status terakhir (SUCCESS | FAILED | PARTIAL)
- `next_run`: Waktu berikutnya job akan dijalankan
- `config_params`: JSONB untuk parameter konfigurasi
- `description`: Deskripsi job
- `timezone`: Timezone untuk cron (default: Asia/Makassar)

### 2. Repository Layer
**Location:** `src/repositories/system/cronJobConfig/`

Repository untuk CRUD operations:
- `findAll.repository.js` - Get all configs
- `findById.repository.js` - Get by ID
- `create.repository.js` - Create new config
- `update.repository.js` - Update config
- `delete.repository.js` - Delete config

### 3. Service Layer
**File:** `src/services/system/cronJobConfig/manageCronJob.service.js`

Services untuk manage cron jobs:
- `getAllCronJobsService()` - Get all cron jobs
- `getCronJobByIdService(id)` - Get by ID
- `createCronJobService(data, options)` - Create dengan audit log
- `updateCronJobService(id, data, options)` - Update dengan audit log
- `deleteCronJobService(id, options)` - Delete dengan audit log
- `enableCronJobService(id, options)` - Enable job
- `disableCronJobService(id, options)` - Disable job
- `pauseCronJobService(id, options)` - Pause job
- `resumeCronJobService(id, options)` - Resume paused job
- `updateLastRunService(id, runInfo)` - Update last run info (internal)

### 4. Centralized Scheduler
**File:** `src/schedulers/centralizedCron.scheduler.js`

Centralized scheduler dengan dynamic control:

**Functions:**
- `initializeCronScheduler()` - Initialize saat app startup
- `shutdownCronScheduler()` - Shutdown saat app shutdown
- `reloadAllCronJobs()` - Reload all jobs dari database
- `enableCronJob(jobId)` - Enable specific job
- `disableCronJob(jobId)` - Disable specific job
- `getSchedulerStatus()` - Get current scheduler status
- `startCronJob(jobConfig)` - Start single job (internal)
- `stopCronJob(jobId)` - Stop single job (internal)

### 5. Job Executors
**Location:** `src/schedulers/jobs/`

Job executor files:
- `rekonsiliasi.job.js` - Rekonsiliasi absensi harian
- `generateLemburBulanan.job.js` - Generate laporan lembur bulanan
- `generateShiftBulanan.job.js` - Generate shift harian bulanan

Setiap job executor adalah async function yang menerima `params` object.

### 6. Controller
**File:** `src/controllers/system/cronJobConfig.controller.js`

REST API endpoints untuk manage cron jobs.

### 7. Seed Script
**File:** `src/scripts/seedCronJobs.script.js`

Script untuk seed default cron job configurations.

## Setup & Installation

### 1. Database Migration

Buat tabel `system.s_cron_job_config`:

```sql
CREATE TABLE system.s_cron_job_config (
  id VARCHAR(50) PRIMARY KEY,
  job_name VARCHAR(100) NOT NULL,
  job_type VARCHAR(50) NOT NULL,
  cron_expression VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'DISABLED',
  last_run TIMESTAMP,
  last_status VARCHAR(20),
  last_error TEXT,
  next_run TIMESTAMP,
  config_params JSONB,
  description TEXT,
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Makassar',
  created_by VARCHAR(50) DEFAULT 'SYSTEM',
  updated_by VARCHAR(50) DEFAULT 'SYSTEM',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cron_job_type ON system.s_cron_job_config(job_type);
CREATE INDEX idx_cron_job_status ON system.s_cron_job_config(status);
CREATE INDEX idx_cron_job_enabled ON system.s_cron_job_config(is_enabled);
CREATE INDEX idx_cron_job_next_run ON system.s_cron_job_config(next_run);
```

### 2. Seed Default Cron Jobs

```bash
# Seed default cron jobs
node src/scripts/seedCronJobs.script.js seed

# Clear all cron jobs (DANGEROUS)
node src/scripts/seedCronJobs.script.js clear

# Reset (clear + seed)
node src/scripts/seedCronJobs.script.js reset
```

### 3. Initialize Scheduler in App

Di `app.js` atau `server.js`:

```javascript
import { initializeCronScheduler, shutdownCronScheduler } from "./schedulers/centralizedCron.scheduler.js";

// Saat app startup
await initializeCronScheduler();

// Saat app shutdown
process.on('SIGTERM', () => {
  shutdownCronScheduler();
  // ... other cleanup
});

process.on('SIGINT', () => {
  shutdownCronScheduler();
  // ... other cleanup
});
```

### 4. Setup Routes

Di `routes/index.js`:

```javascript
import {
  getAllCronJobs,
  getCronJobById,
  createCronJob,
  updateCronJob,
  deleteCronJob,
  enableCronJob,
  disableCronJob,
  pauseCronJob,
  resumeCronJob,
  reloadCronJobs,
  getSchedulerStatusController,
} from "../controllers/system/cronJobConfig.controller.js";

// Routes
router.get("/cron-jobs", getAllCronJobs);
router.get("/cron-jobs/scheduler/status", getSchedulerStatusController);
router.get("/cron-jobs/:id", getCronJobById);
router.post("/cron-jobs", createCronJob);
router.put("/cron-jobs/:id", updateCronJob);
router.delete("/cron-jobs/:id", deleteCronJob);

// Control endpoints
router.post("/cron-jobs/:id/enable", enableCronJob);
router.post("/cron-jobs/:id/disable", disableCronJob);
router.post("/cron-jobs/:id/pause", pauseCronJob);
router.post("/cron-jobs/:id/resume", resumeCronJob);
router.post("/cron-jobs/reload", reloadCronJobs);
```

## API Documentation

### Get All Cron Jobs

```
GET /api/cron-jobs?enabledOnly=true
```

**Response:**
```json
{
  "success": true,
  "message": "Cron jobs retrieved successfully",
  "data": [
    {
      "id": "CRON-REKONSILIASI-HARIAN",
      "job_name": "Rekonsiliasi Absensi Harian",
      "job_type": "REKONSILIASI_HARIAN",
      "cron_expression": "0 2 * * *",
      "is_enabled": true,
      "status": "ENABLED",
      "last_run": "2025-01-13T02:00:00.000Z",
      "last_status": "SUCCESS",
      "next_run": "2025-01-14T02:00:00.000Z",
      "config_params": {
        "skipWeekend": false
      },
      "description": "Proses rekonsiliasi absensi harian otomatis...",
      "timezone": "Asia/Makassar"
    }
  ]
}
```

### Enable Cron Job

```
POST /api/cron-jobs/{id}/enable
```

**Response:**
```json
{
  "success": true,
  "message": "Cron job enabled successfully",
  "data": {
    "config": { ... },
    "scheduler_started": true
  }
}
```

### Disable Cron Job

```
POST /api/cron-jobs/{id}/disable
```

### Pause Cron Job

```
POST /api/cron-jobs/{id}/pause
```

### Resume Cron Job

```
POST /api/cron-jobs/{id}/resume
```

### Reload All Cron Jobs

```
POST /api/cron-jobs/reload
```

**Response:**
```json
{
  "success": true,
  "message": "Cron jobs reloaded successfully",
  "data": {
    "success": true,
    "stopped_count": 2,
    "started_count": 1,
    "failed_count": 0,
    "active_jobs": ["CRON-REKONSILIASI-HARIAN"]
  }
}
```

### Get Scheduler Status

```
GET /api/cron-jobs/scheduler/status
```

**Response:**
```json
{
  "success": true,
  "message": "Scheduler status retrieved successfully",
  "data": {
    "active_jobs_count": 1,
    "active_jobs": [
      {
        "job_id": "CRON-REKONSILIASI-HARIAN",
        "is_running": true
      }
    ],
    "available_executors": [
      "REKONSILIASI_HARIAN",
      "GENERATE_LEMBUR_BULANAN",
      "GENERATE_SHIFT_BULANAN"
    ]
  }
}
```

## Default Cron Jobs

### 1. Rekonsiliasi Absensi Harian
- **ID:** `CRON-REKONSILIASI-HARIAN`
- **Type:** `REKONSILIASI_HARIAN`
- **Schedule:** `0 2 * * *` (Setiap hari jam 02:00 WIB)
- **Status:** ENABLED (by default)
- **Description:** Proses rekonsiliasi absensi harian untuk data H-1
- **Config Params:**
  ```json
  {
    "skipWeekend": false,
    "tanggal": null
  }
  ```

### 2. Generate Laporan Lembur Bulanan
- **ID:** `CRON-GENERATE-LEMBUR-BULANAN`
- **Type:** `GENERATE_LEMBUR_BULANAN`
- **Schedule:** `0 1 1 * *` (Setiap tanggal 1 jam 01:00)
- **Status:** DISABLED (by default)
- **Description:** Generate laporan realisasi lembur untuk bulan sebelumnya
- **Config Params:**
  ```json
  {
    "offsetMonth": 1,
    "periodeBulan": null
  }
  ```

### 3. Generate Shift Harian Bulanan
- **ID:** `CRON-GENERATE-SHIFT-BULANAN`
- **Type:** `GENERATE_SHIFT_BULANAN`
- **Schedule:** `0 0 1 * *` (Setiap tanggal 1 jam 00:00)
- **Status:** DISABLED (by default)
- **Description:** Pre-generate jadwal shift untuk bulan depan
- **Config Params:**
  ```json
  {
    "offsetMonth": 1,
    "mode": "skip",
    "idPegawai": null
  }
  ```

## Menambah Cron Job Baru

### 1. Buat Job Executor

Buat file di `src/schedulers/jobs/namaJob.job.js`:

```javascript
export const jalankanNamaJob = async (params = {}) => {
  console.log("Starting namaJob...");

  // Your job logic here

  console.log("Job completed");
};

export default jalankanNamaJob;
```

### 2. Register di Centralized Scheduler

Edit `src/schedulers/centralizedCron.scheduler.js`:

```javascript
import { jalankanNamaJob } from "./jobs/namaJob.job.js";

const jobExecutors = new Map([
  // ... existing executors
  ["NAMA_JOB_TYPE", jalankanNamaJob],
]);
```

### 3. Update CRON_JOB_TYPES

Edit `src/models/system/cronJobConfig.model.js`:

```javascript
const CRON_JOB_TYPES = [
  // ... existing types
  "NAMA_JOB_TYPE",
];
```

### 4. Seed ke Database

Tambahkan ke `src/scripts/seedCronJobs.script.js`:

```javascript
const defaultCronJobs = [
  // ... existing jobs
  {
    id: "CRON-NAMA-JOB",
    job_name: "Nama Job",
    job_type: "NAMA_JOB_TYPE",
    cron_expression: "0 3 * * *",
    is_enabled: false,
    status: "DISABLED",
    config_params: { /* params */ },
    description: "Deskripsi job",
    timezone: "Asia/Makassar",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
  },
];
```

### 5. Run Seed

```bash
node src/scripts/seedCronJobs.script.js seed
```

## Monitoring & Troubleshooting

### Check Scheduler Status

```bash
curl http://localhost:3000/api/cron-jobs/scheduler/status
```

### Check Last Run

```sql
SELECT id, job_name, last_run, last_status, last_error, next_run
FROM system.s_cron_job_config
WHERE is_enabled = true
ORDER BY last_run DESC;
```

### Check Process History

```sql
SELECT *
FROM system.s_proses_harian
WHERE jenis_proses = 'REKONSILIASI'
ORDER BY created_at DESC
LIMIT 10;
```

### Common Issues

**Issue: Cron job tidak jalan**
- Cek `is_enabled = true` di database
- Cek scheduler status via API
- Cek logs untuk error messages
- Reload cron jobs: `POST /api/cron-jobs/reload`

**Issue: Invalid cron expression**
- Validate expression di https://crontab.guru
- Format: `second minute hour day month dayOfWeek`
- Contoh: `0 2 * * *` = Jam 02:00 setiap hari

**Issue: Job executor not found**
- Cek job type terdaftar di `jobExecutors` Map
- Cek import statement di centralized scheduler
- Reload scheduler setelah menambah executor

## Best Practices

1. **Always use transactions** dalam job executors
2. **Log to s_proses_harian** untuk batch processes
3. **Update last_run** otomatis via scheduler
4. **Use config_params** untuk flexibility
5. **Enable audit logging** untuk semua config changes
6. **Test locally** sebelum enable di production
7. **Monitor execution time** via s_proses_harian
8. **Set proper timezone** (default: Asia/Makassar)
9. **Use descriptive job names** untuk clarity
10. **Document config_params** di description

## Security

- Semua CRUD operations memiliki **audit trail**
- Endpoint harus dilindungi dengan **authentication**
- Role-based access untuk enable/disable jobs
- Validate cron expression sebelum save
- Prevent concurrent execution dengan locking

## Performance

- In-memory task map untuk fast lookup
- Lazy loading job executors
- Transaction-based execution untuk consistency
- Batch processing dengan delay untuk prevent DB overload
- Indexes pada frequently queried fields

## Dependencies

- `node-cron` - Cron scheduler library
- `cron-parser` - Parse dan validate cron expressions
- `sequelize` - ORM untuk database operations

```bash
npm install node-cron cron-parser
```
