module.exports = {
  apps: [
    {
      name: "nutrition-api",
      script: "./src/server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        ENVIRONMENT: "production",
        HOST: "127.0.0.1",
        PORT: 5000,
      },
      error_file: "./logs/err.be.log",
      out_file: "./logs/out.be.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      watch: false, // Set to true only if you want auto-restart on file changes
      ignore_watch: ["node_modules", "logs"],
      max_memory_restart: "1GB", // Auto-restart if memory exceeds 1GB
      autorestart: true,
      restart_delay: 3000,
      kill_timeout: 10000,
      listen_timeout: 10000,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
