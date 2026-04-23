const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, 'startup.log');
function log(msg) {
  try { fs.appendFileSync(logFile, new Date().toISOString() + ' ' + msg + '\n'); } catch(e) {}
}

log('=== NEW START ===');
log('Node: ' + process.version);
log('CWD: ' + process.cwd());
log('DIR: ' + __dirname);
log('MONGO_URI set: ' + !!process.env.MONGO_URI);
log('PORT: ' + (process.env.PORT || 'not set'));
log('UPLOADS_DIR: ' + (process.env.UPLOADS_DIR || 'not set'));

process.on('uncaughtException', (err) => {
  log('UNCAUGHT: ' + err.message + ' | ' + err.stack);
});
process.on('unhandledRejection', (reason) => {
  log('UNHANDLED: ' + String(reason));
});

const serverPath = path.join(__dirname, 'server');

log('Running npm install...');
try {
  execSync('npm install --production', { cwd: serverPath, stdio: 'pipe', timeout: 120000 });
  log('npm install OK');
} catch (e) {
  log('npm install WARN: ' + e.message);
}

log('Importing server...');
import('./server/index.js').then(() => {
  log('Server import done');
}).catch(err => {
  log('IMPORT FAIL: ' + err.message + ' | ' + err.stack);
  process.exit(1);
});
