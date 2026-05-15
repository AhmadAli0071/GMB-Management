module.exports = {
  apps: [{
    name: "gmb-portal",
    script: "index.js",
    cwd: "/opt/gmb-management/server",
    instances: 1,
    exec_mode: "fork",
    max_restarts: 10,
    restart_delay: 5000,
    exp_backoff_restart_delay: 1000,
    max_memory_restart: "512M",
    env: {
      NODE_ENV: "production",
      DOTENV_CONFIG_PATH: "/opt/gmb-management/.env"
    }
  }]
};
