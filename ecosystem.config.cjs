module.exports = {
  apps: [
    {
      name: "nutrition-api",
      script: "./src/server.js",
      instances: "2", // Use 1 for single-instance mode or "max" for available CPU cores
      exec_mode: "cluster",
      //   env: {
      //     NODE_ENV: "development",
      //   },
      //   env_production: {
      //     NODE_ENV: "production",
      //   },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      watch: false, // Set to true only if you want auto-restart on file changes
      ignore_watch: ["node_modules", "logs"],
      max_memory_restart: "500M", // Auto-restart if memory exceeds 500MB
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
