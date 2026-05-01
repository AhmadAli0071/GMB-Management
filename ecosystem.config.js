module.exports = {
  apps: [{
    name: "gmb-portal",
    script: "index.js",
    cwd: "/opt/gmb-management/server",
    env: {
      NODE_ENV: "production",
      DOTENV_CONFIG_PATH: "/opt/gmb-management/.env"
    }
  }]
};
