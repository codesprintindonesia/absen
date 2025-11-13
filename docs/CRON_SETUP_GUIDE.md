# Setup Guide: Cron Job System

Panduan lengkap untuk setup sistem cron job dengan dynamic enable/disable.

## Prerequisites

- PostgreSQL 12+
- Node.js 18+
- npm atau yarn
- Database `absensi` sudah ada

## Langkah-langkah Setup

### 1. Install Dependencies

```bash
# Install cron-parser (node-cron sudah terinstall)
npm install cron-parser
```

Atau tambahkan ke `package.json`:

```json
{
  "dependencies": {
    "node-cron": "^4.2.1",
    "cron-parser": "^2.4.0"
  }
}
```

### 2. Run Database Migration

Jalankan migration script untuk membuat tabel `system.s_cron_job_config`:

```bash
# Via psql
psql -U postgres -d absensi -f migrations/create_cron_job_config_table.sql

# Atau via GUI tool (pgAdmin, DBeaver)
# Copy-paste isi file migrations/create_cron_job_config_table.sql
```

**Verify migration:**

```sql
-- Check if table exists
SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_schema = 'system'
  AND table_name = 's_cron_job_config';

-- Check table structure
\d system.s_cron_job_config
```

### 3. Seed Default Cron Jobs

Jalankan seed script untuk insert default cron job configurations:

```bash
# Seed default cron jobs
node src/scripts/seedCronJobs.script.js seed
```

**Output yang diharapkan:**

```
🌱 Starting cron job seed process...

✅ Created: CRON-REKONSILIASI-HARIAN - Rekonsiliasi Absensi Harian
✅ Created: CRON-GENERATE-LEMBUR-BULANAN - Generate Laporan Lembur Bulanan
✅ Created: CRON-GENERATE-SHIFT-BULANAN - Generate Shift Harian Bulanan

📊 Seed Summary:
   Created: 3
   Updated: 0
   Total: 3

✅ Cron job seed completed successfully!
```

**Verify seed:**

```sql
SELECT id, job_name, is_enabled, status, cron_expression
FROM system.s_cron_job_config
ORDER BY id;
```

Expected result:
```
┌─────────────────────────────────┬─────────────────────────────────┬────────────┬──────────┬───────────────────┐
│ id                              │ job_name                        │ is_enabled │ status   │ cron_expression   │
├─────────────────────────────────┼─────────────────────────────────┼────────────┼──────────┼───────────────────┤
│ CRON-GENERATE-LEMBUR-BULANAN    │ Generate Laporan Lembur Bulanan │ false      │ DISABLED │ 0 1 1 * *         │
│ CRON-GENERATE-SHIFT-BULANAN     │ Generate Shift Harian Bulanan   │ false      │ DISABLED │ 0 0 1 * *         │
│ CRON-REKONSILIASI-HARIAN        │ Rekonsiliasi Absensi Harian     │ true       │ ENABLED  │ 0 2 * * *         │
└─────────────────────────────────┴─────────────────────────────────┴────────────┴──────────┴───────────────────┘
```

### 4. Verify App Integration

File-file yang sudah diupdate:

✅ **src/app.js** - Cron scheduler initialization added
✅ **src/routes/main.route.js** - Cron job routes mounted

**Check app.js:**

```javascript
// Should see these imports
import { initializeCronScheduler, shutdownCronScheduler } from "./schedulers/centralizedCron.scheduler.js";

// Should see initialization before server start
await initializeCronScheduler();

// Should see shutdown in graceful handler
shutdownCronScheduler();
```

**Check routes:**

```javascript
// In main.route.js
import cronJobConfigRoutes from "./system/cronJobConfig.route.js";
router.use("/cron-jobs", cronJobConfigRoutes);
```

### 5. Start Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

**Expected console output:**

```
🚀 Initializing centralized cron scheduler...

🔄 Reloading all cron jobs from database...
   Stopped: 0 jobs

📋 Found 1 enabled jobs in database

✅ Started cron job: Rekonsiliasi Absensi Harian (CRON-REKONSILIASI-HARIAN)
   Schedule: 0 2 * * *
   Next run: 2025-01-14T02:00:00.000Z

✅ Reload complete!
   Stopped: 0 jobs
   Started: 1 jobs
   Failed: 0 jobs

✅ Cron scheduler initialized successfully

HTTP Server running on port 3000
```

### 6. Test API Endpoints

**Get all cron jobs:**

```bash
curl http://localhost:3000/api/cron-jobs
```

**Get scheduler status:**

```bash
curl http://localhost:3000/api/cron-jobs/scheduler/status
```

Expected response:
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

**Enable a cron job:**

```bash
curl -X POST http://localhost:3000/api/cron-jobs/CRON-GENERATE-LEMBUR-BULANAN/enable
```

**Disable a cron job:**

```bash
curl -X POST http://localhost:3000/api/cron-jobs/CRON-REKONSILIASI-HARIAN/disable
```

### 7. Verify Cron Job Execution

**Option 1: Wait for scheduled time**

Tunggu sampai waktu scheduled (misal: 02:00 untuk rekonsiliasi harian)

**Option 2: Manually trigger (for testing)**

Buat endpoint manual trigger di controller (opsional):

```javascript
// Add to cronJobConfig.controller.js
export const manualTriggerJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get job config
    const jobConfig = await getCronJobByIdService(id);

    // Execute job immediately (bypassing schedule)
    // ... implementation

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Job triggered manually",
    });
  } catch (error) {
    next(error);
  }
};
```

**Option 3: Check database logs**

```sql
-- Check s_proses_harian for batch job execution logs
SELECT *
FROM system.s_proses_harian
WHERE jenis_proses = 'REKONSILIASI'
ORDER BY created_at DESC
LIMIT 10;

-- Check cron job last run status
SELECT id, job_name, last_run, last_status, last_error, next_run
FROM system.s_cron_job_config
WHERE is_enabled = true
ORDER BY last_run DESC;
```

## Common Issues & Troubleshooting

### Issue 1: Cron jobs tidak jalan setelah start aplikasi

**Symptom:**
```
✅ Reload complete!
   Stopped: 0 jobs
   Started: 0 jobs  <-- Should be > 0
   Failed: 0 jobs
```

**Solution:**
1. Check database - pastikan ada job dengan `is_enabled = true`
   ```sql
   SELECT id, is_enabled, status FROM system.s_cron_job_config;
   ```

2. Enable job via API:
   ```bash
   curl -X POST http://localhost:3000/api/cron-jobs/CRON-REKONSILIASI-HARIAN/enable
   ```

3. Reload scheduler:
   ```bash
   curl -X POST http://localhost:3000/api/cron-jobs/reload
   ```

### Issue 2: Error "cron-parser is not defined"

**Symptom:**
```
Error: Cannot find module 'cron-parser'
```

**Solution:**
```bash
npm install cron-parser
```

### Issue 3: Invalid cron expression

**Symptom:**
```
❌ Invalid cron expression for CRON-XXX: ...
```

**Solution:**
1. Validate cron expression di https://crontab.guru
2. Format yang benar: `minute hour day month dayOfWeek`
   - `0 2 * * *` = Jam 02:00 setiap hari ✅
   - `02 * * * *` = Menit 02 setiap jam ❌ (wrong for daily)

3. Update via API:
   ```bash
   curl -X PUT http://localhost:3000/api/cron-jobs/CRON-XXX \
     -H "Content-Type: application/json" \
     -d '{"cron_expression": "0 2 * * *"}'
   ```

### Issue 4: Job executor not found

**Symptom:**
```
❌ No executor found for job type: REKONSILIASI_HARIAN
```

**Solution:**
1. Check if executor is registered in `centralizedCron.scheduler.js`:
   ```javascript
   const jobExecutors = new Map([
     ["REKONSILIASI_HARIAN", jalankanRekonsiliasi],
     // ...
   ]);
   ```

2. Check if import statement exists:
   ```javascript
   import { jalankanRekonsiliasi } from "./jobs/rekonsiliasi.job.js";
   ```

### Issue 5: Database connection error

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
1. Check PostgreSQL is running:
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql

   # Windows
   services.msc # Check PostgreSQL service
   ```

2. Check database credentials in `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=absensi
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

3. Test connection:
   ```bash
   psql -U postgres -d absensi -c "SELECT version();"
   ```

## Post-Setup Checklist

- [ ] Database table `system.s_cron_job_config` created
- [ ] Default cron jobs seeded (3 jobs)
- [ ] `cron-parser` dependency installed
- [ ] App.js includes scheduler initialization
- [ ] Routes mounted in main.route.js
- [ ] Application starts without errors
- [ ] Scheduler shows active jobs in console
- [ ] API endpoint `/cron-jobs/scheduler/status` returns data
- [ ] At least one job is ENABLED and running
- [ ] Check `s_proses_harian` table for execution logs (after scheduled time)

## Next Steps

1. **Configure cron schedules** sesuai kebutuhan production
2. **Enable jobs** yang diperlukan via API atau database
3. **Monitor execution** via `s_proses_harian` table
4. **Setup alerts** untuk failed jobs (opsional)
5. **Review logs** regularly untuk performance tuning

## Security Recommendations

1. **Protect API endpoints** dengan authentication middleware
2. **Role-based access** untuk enable/disable jobs
3. **Audit all changes** (sudah implemented)
4. **Validate cron expressions** sebelum save (sudah implemented)
5. **Limit who can create jobs** (admin only)

## Maintenance

**Daily:**
- Check failed jobs di `s_proses_harian`
- Review last_error di `s_cron_job_config`

**Weekly:**
- Review execution times untuk performance
- Check disk space untuk logs

**Monthly:**
- Archive old process logs
- Review dan optimize slow jobs

## Support

Jika masih ada issue setelah mengikuti guide ini:

1. Check logs di console
2. Check database logs di `s_proses_harian`
3. Review [CRON_JOBS.md](./CRON_JOBS.md) untuk detail lebih lanjut
4. Contact development team

---

**Setup completed!** 🎉

Sistem cron job sekarang siap digunakan dengan kemampuan dynamic enable/disable tanpa restart aplikasi.
