module.exports = {
  apps: [
    {
      name: 'hostelshifts-server',
      script: 'yarn',
      args: 'start:prod',
      cwd: '/var/dev/hostelshifts-server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      // Logging configuration
      out_file: `/var/dev/logs/server${new Date().toISOString().replace(/[:.]/g, '-')}-out.log`,
      error_file: `/var/dev/logs/server${new Date().toISOString().replace(/[:.]/g, '-')}-error.log`,
      log_file: `/var/dev/logs/server${new Date().toISOString().replace(/[:.]/g, '-')}-combined.log`,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Process management
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      
      // Advanced settings
      node_args: '--max-old-space-size=1024',
      exec_mode: 'fork'
    }
  ]
};