// ================================================================
// PM2 Ecosystem Configuration
// Bank Sultra - Absensi MSDM
// ================================================================

module.exports = {
  apps: [
    {
      // ================================================================
      // APPLICATION SETTINGS
      // ================================================================
      name: "ABSENSI",
      script: "src/app.js",
      cwd: "./",

      // ================================================================
      // EXECUTION MODE
      // ================================================================
      instances: process.env.NODE_ENV === 'production' ? 2 : 1,
      exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',

      // ================================================================
      // WATCH & RESTART
      // ================================================================
      watch: process.env.NODE_ENV !== 'production',
      ignore_watch: [
        "node_modules",
        "logs",
        ".git",
        "*.log",
        ".env*",
        "migrations",
        "docs"
      ],
      watch_delay: 1000, // Wait 1s before restarting

      // ================================================================
      // RESTART POLICY
      // ================================================================
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s", // Consider app crashed if uptime < 10s
      restart_delay: 4000, // Wait 4s before restart

      // ================================================================
      // RESOURCE LIMITS
      // ================================================================
      max_memory_restart: "512M", // Restart if memory exceeds 512MB

      // ================================================================
      // LOGGING
      // ================================================================
      time: true, // Prefix logs with timestamp
      merge_logs: true, // Merge logs from all instances
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      log_file: "logs/pm2-combined.log",

      // ================================================================
      // PROCESS MANAGEMENT
      // ================================================================
      kill_timeout: 5000, // Wait 5s before force kill
      listen_timeout: 3000, // Wait 3s for app to listen
      shutdown_with_message: true, // Allow graceful shutdown

      // ================================================================
      // SOURCE MAP SUPPORT
      // ================================================================
      source_map_support: false,

      // ================================================================
      // ENVIRONMENT VARIABLES
      // ================================================================
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 5000,
      },
    },
  ],
};

// ================================================================
// PETUNJUK PENGGUNAAN
// ================================================================
//
// 1. DEVELOPMENT (1 instance, watch mode aktif)
//    pm2 start ecosystem.config.cjs --env development
//    pm2 logs ABSENSI
//
// 2. PRODUCTION (2 instances cluster, watch mode off)
//    pm2 start ecosystem.config.cjs --env production
//    pm2 logs ABSENSI
//
// 3. RELOAD TANPA DOWNTIME
//    pm2 reload ABSENSI
//    pm2 reload ecosystem.config.cjs --env production
//
// 4. MONITORING
//    pm2 monit                    # Real-time monitoring
//    pm2 status                   # Status semua aplikasi
//    pm2 describe ABSENSI         # Detail aplikasi
//    pm2 list                     # List semua aplikasi
//
// 5. LOGS
//    pm2 logs ABSENSI             # Stream logs real-time
//    pm2 logs ABSENSI --lines 100 # Tampilkan 100 baris terakhir
//    pm2 logs ABSENSI --err       # Hanya error logs
//    pm2 flush ABSENSI            # Clear logs
//
// 6. RESTART & STOP
//    pm2 restart ABSENSI          # Restart aplikasi
//    pm2 stop ABSENSI             # Stop aplikasi
//    pm2 delete ABSENSI           # Hapus dari PM2
//
// 7. AUTO STARTUP (Jalankan otomatis saat server restart)
//    pm2 startup                  # Generate startup script
//    pm2 save                     # Save current process list
//    pm2 unstartup                # Disable auto startup
//
// 8. UPDATE ECOSYSTEM (Setelah edit file ini)
//    pm2 delete ABSENSI
//    pm2 start ecosystem.config.cjs --env production
//
// ================================================================
// CATATAN PENTING
// ================================================================
//
// - File menggunakan .cjs karena PM2 membutuhkan CommonJS format
// - Production mode: 2 instances cluster untuk load balancing
// - Development mode: 1 instance fork untuk debugging
// - Watch mode hanya aktif di development
// - Memory limit: 512MB (auto restart jika melebihi)
// - Max 10 restarts dalam crash loop protection
// - Logs disimpan di folder: logs/pm2-*.log
//