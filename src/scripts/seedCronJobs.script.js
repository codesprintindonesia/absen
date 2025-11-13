// ================================================================
// src/scripts/seedCronJobs.script.js
// Script untuk seed default cron job configurations ke database
// ================================================================

import { getSequelize } from "../libraries/databaseInstance.library.js";
import { CronJobConfig } from "../models/system/cronJobConfig.model.js";

/**
 * Default cron job configurations
 */
const defaultCronJobs = [
  {
    id: "CRON-REKONSILIASI-HARIAN",
    job_name: "Rekonsiliasi Absensi Harian",
    job_type: "REKONSILIASI_HARIAN",
    cron_expression: "0 2 * * *", // Setiap hari jam 02:00
    is_enabled: true,
    status: "ENABLED",
    config_params: {
      skipWeekend: false,
      tanggal: null, // null = yesterday (H-1)
    },
    description:
      "Proses rekonsiliasi absensi harian otomatis. Matching raw logs dengan shift jadwal, hitung lembur, terlambat, jam kerja efektif. Berjalan setiap hari jam 02:00 WIB untuk data H-1.",
    timezone: "Asia/Makassar",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
  },
  {
    id: "CRON-GENERATE-LEMBUR-BULANAN",
    job_name: "Generate Laporan Lembur Bulanan",
    job_type: "GENERATE_LEMBUR_BULANAN",
    cron_expression: "0 1 1 * *", // Setiap tanggal 1 jam 01:00
    is_enabled: false, // Default disabled, aktifkan manual
    status: "DISABLED",
    config_params: {
      offsetMonth: 1, // 1 = bulan lalu
      periodeBulan: null, // null = auto calculate last month
    },
    description:
      "Generate laporan realisasi lembur bulanan untuk semua pegawai. Hitung total jam lembur, hari terlambat, hari kerja efektif dari data absensi harian. Berjalan setiap tanggal 1 jam 01:00 untuk bulan sebelumnya.",
    timezone: "Asia/Makassar",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
  },
  {
    id: "CRON-GENERATE-SHIFT-BULANAN",
    job_name: "Generate Shift Harian Bulanan",
    job_type: "GENERATE_SHIFT_BULANAN",
    cron_expression: "0 0 1 * *", // Setiap tanggal 1 jam 00:00
    is_enabled: false, // Default disabled, aktifkan manual
    status: "DISABLED",
    config_params: {
      offsetMonth: 1, // 1 = bulan depan
      mode: "skip", // skip existing records
      idPegawai: null, // null = all employees
    },
    description:
      "Pre-generate jadwal shift harian untuk bulan depan. Support fixed shift dan rotating patterns (6-day, 21-day cycle). Berjalan setiap tanggal 1 jam 00:00 untuk bulan berikutnya.",
    timezone: "Asia/Makassar",
    created_by: "SYSTEM",
    updated_by: "SYSTEM",
  },
];

/**
 * Seed default cron jobs ke database
 * @returns {Promise<void>}
 */
const seedCronJobs = async () => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    console.log("\n🌱 Starting cron job seed process...\n");

    transaction = await sequelize.transaction();

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const cronJob of defaultCronJobs) {
      const existing = await CronJobConfig.findByPk(cronJob.id, {
        transaction,
      });

      if (existing) {
        // Update existing (preserve user modifications to is_enabled and config_params)
        await CronJobConfig.update(
          {
            job_name: cronJob.job_name,
            job_type: cronJob.job_type,
            cron_expression: cronJob.cron_expression,
            description: cronJob.description,
            timezone: cronJob.timezone,
            updated_at: new Date(),
          },
          {
            where: { id: cronJob.id },
            transaction,
          }
        );

        console.log(`✏️  Updated: ${cronJob.id} - ${cronJob.job_name}`);
        updatedCount++;
      } else {
        // Create new
        await CronJobConfig.create(
          {
            ...cronJob,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            transaction,
          }
        );

        console.log(`✅ Created: ${cronJob.id} - ${cronJob.job_name}`);
        createdCount++;
      }
    }

    await transaction.commit();

    console.log("\n📊 Seed Summary:");
    console.log(`   Created: ${createdCount}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Total: ${createdCount + updatedCount}`);
    console.log("\n✅ Cron job seed completed successfully!\n");
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("\n❌ Error seeding cron jobs:", error.message);
    throw error;
  }
};

/**
 * Clear all cron jobs from database (DANGEROUS - Use with caution)
 * @returns {Promise<void>}
 */
const clearAllCronJobs = async () => {
  const sequelize = await getSequelize();
  let transaction;

  try {
    console.log("\n⚠️  WARNING: Clearing all cron jobs from database...\n");

    transaction = await sequelize.transaction();

    const deletedCount = await CronJobConfig.destroy({
      where: {},
      truncate: true,
      transaction,
    });

    await transaction.commit();

    console.log(`🗑️  Deleted ${deletedCount} cron jobs\n`);
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("\n❌ Error clearing cron jobs:", error.message);
    throw error;
  }
};

// ================================================================
// COMMAND LINE INTERFACE
// ================================================================

const command = process.argv[2];

if (command === "seed") {
  seedCronJobs()
    .then(() => {
      console.log("Exiting...");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
} else if (command === "clear") {
  clearAllCronJobs()
    .then(() => {
      console.log("Exiting...");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
} else if (command === "reset") {
  clearAllCronJobs()
    .then(() => seedCronJobs())
    .then(() => {
      console.log("Exiting...");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
} else {
  console.log(`
🌱 Cron Job Seed Script

Usage:
  node src/scripts/seedCronJobs.script.js <command>

Commands:
  seed    - Seed default cron jobs (create new or update existing)
  clear   - Clear all cron jobs from database (DANGEROUS)
  reset   - Clear all cron jobs then seed defaults

Examples:
  npm run seed:cron-jobs
  node src/scripts/seedCronJobs.script.js seed
  `);
  process.exit(0);
}

export { seedCronJobs, clearAllCronJobs };
