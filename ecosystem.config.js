// PM2 process config — deploy at /var/www/eit-samarambh-2026, runs on port 3015.
// Start with:  pm2 start ecosystem.config.js
// Then:        pm2 save && pm2 startup   (so it survives a server reboot)

module.exports = {
  apps: [
    {
      name: "eit-samarambh-2026",
      cwd: "/var/www/eit-samarambh-2026",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3015",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3015,
      },
      error_file: "/var/www/eit-samarambh-2026/logs/pm2-error.log",
      out_file: "/var/www/eit-samarambh-2026/logs/pm2-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};