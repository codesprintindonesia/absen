// ================================================================
// src/scripts/runMigration.script.js
// Script untuk menjalankan SQL migration
// ================================================================

import fs from "fs/promises";
import { getSequelize } from "../libraries/databaseInstance.library.js";

/**
 * Run SQL migration from file
 * @param {string} filePath - Path to SQL file
 * @returns {Promise<void>}
 */
const runMigration = async (filePath) => {
  const sequelize = await getSequelize();

  try {
    console.log(`\n🔄 Running migration: ${filePath}\n`);

    // Read SQL file
    const sql = await fs.readFile(filePath, "utf8");

    // Execute SQL
    await sequelize.query(sql);

    console.log(`\n✅ Migration completed successfully!\n`);
  } catch (error) {
    console.error(`\n❌ Migration failed:`, error.message);
    throw error;
  }
};

// ================================================================
// COMMAND LINE INTERFACE
// ================================================================

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.log(`
🔄 Migration Runner

Usage:
  node src/scripts/runMigration.script.js <migration-file>

Example:
  node src/scripts/runMigration.script.js migrations/add_test_cron_type.sql
  `);
  process.exit(0);
}

runMigration(migrationFile)
  .then(() => {
    console.log("Exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
