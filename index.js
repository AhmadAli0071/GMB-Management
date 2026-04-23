const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const crashLog = path.join(__dirname, 'crash.log');
process.on('uncaughtException', (err) => {
  const msg = `${new Date().toISOString()} UNCAUGHT: ${err.message}\n${err.stack}\n\n`;
  try { fs.appendFileSync(crashLog, msg); } catch(e) {}
  console.error(msg);
});
process.on('unhandledRejection', (reason) => {
  const msg = `${new Date().toISOString()} UNHANDLED: ${String(reason)}\n\n`;
  try { fs.appendFileSync(crashLog, msg); } catch(e) {}
  console.error(msg);
});

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        const val = trimmed.substring(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  });
}

const serverPath = path.join(__dirname, 'server');
execSync('npm install --production', { cwd: serverPath, stdio: 'pipe' });

import('./server/index.js').catch(err => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
