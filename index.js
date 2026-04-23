const { execSync } = require('child_process');
const path = require('path');
const serverPath = path.join(__dirname, 'server');
try { execSync('npm install --production', { cwd: serverPath }); } catch(e) {}
import('./server/index.js');
