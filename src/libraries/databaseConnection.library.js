import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize } from "sequelize";
import chalk from "chalk";
import { decryptString } from "./decrypt.library.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class Database {
  constructor() {
    this.connection = null;
    this.connected = false;
    this.profile = null;
  }

  /**
   * Membaca konfigurasi dari file terenkripsi (.json.enc) atau plaintext (.json).
   * @param {string} fileConnection nama profile (mis: "development")
   */
  async getConfigurationFromFile(fileConnection = "development") {
    const baseDir = path.join(__dirname, "..", "files", "databases");
    const encPath = path.join(baseDir, `${fileConnection}.json.enc`);
    const jsonPath = path.join(baseDir, `${fileConnection}.json`);

    // Prioritas: file terenkripsi
    try {
      await fs.access(encPath);
      const b64 = await fs.readFile(encPath, "utf8");
      const plaintext = decryptString(b64);

      JSON.parse(plaintext); // validasi JSON
      return JSON.parse(plaintext);
    } catch (err) {
      // fallback ke plaintext
      console.log("ERROR", err.message);
    }

    try {
      await fs.access(jsonPath);
      const configData = await fs.readFile(jsonPath, "utf8");
      JSON.parse(configData); // validasi JSON
      console.log(chalk.yellow(`WARNING: Using plaintext config: ${jsonPath}`));
      return JSON.parse(configData);
    } catch (err) {
      console.log("ERROR 2", err.message);
      throw new Error(
        `Config file tidak ditemukan: ${encPath} atau ${jsonPath}`
      );
    }
  }

  /**
   * Membuat koneksi Sequelize
   * @param {string} profile nama profile (mis: "development")
   */
  async connect(profile) {
    if (!profile) throw new Error("Profile database belum ditentukan.");

    try {
      const config = await this.getConfigurationFromFile(profile);

      this.connection = new Sequelize(
        config.dbName,
        config.dbUser,
        config.dbPassword,
        {
          host: config.dbHost,
          port: config.dbPort,
          dialect: config.dbDialect,
          timezone: process.env.DB_TIMEZONE || config.timezone || "+08:00",
          pool: {
            max: process.env.DB_POOL_MAX
              ? Number(process.env.DB_POOL_MAX)
              : config.pool?.max ?? 10,
            min: process.env.DB_POOL_MIN
              ? Number(process.env.DB_POOL_MIN)
              : config.pool?.min ?? 0,
            acquire: process.env.DB_POOL_ACQUIRE
              ? Number(process.env.DB_POOL_ACQUIRE)
              : config.pool?.acquire ?? 30000,
            idle: process.env.DB_POOL_IDLE
              ? Number(process.env.DB_POOL_IDLE)
              : config.pool?.idle ?? 10000,
            evict: process.env.DB_POOL_EVICT
              ? Number(process.env.DB_POOL_EVICT)
              : config.pool?.evict ?? 1000,
          },
          logging: false, // set true jika ingin debug query
          define: {
            underscored: true,
            freezeTableName: false,
            timestamps: true,
          },
        }
      );

      // test koneksi
      await this.connection.authenticate();
      // console.log(chalk.green(`✓ Database Connected - PID ${process.pid}`));
      // console.log(`Database: ${config.dbName} | Dialect: ${config.dbDialect}`);

      this.connected = true;
      this.profile = profile;
      return true;
    } catch (err) {
      // console.error(chalk.red("Database connection error:"), err.message);
      this.connected = false;
      throw err;
    }
  }

  /**
   * Mendapatkan status koneksi
   */
  getStatus() {
    return {
      connected: this.connected,
      profile: this.profile,
    };
  }

  /**
   * Mendapatkan instance Sequelize
   */
  getConnection() {
    if (!this.connection) throw new Error("Belum terkoneksi ke database.");
    return this.connection;
  }

  /**
   * Tutup koneksi
   */
  async close() {
    if (this.connection) {
      await this.connection.close();
      this.connected = false;
      console.log(chalk.yellow("Database connection closed"));
    }
  }
}
