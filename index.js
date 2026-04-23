const { execSync } = require('child_process');
const path = require('path');
const serverPath = path.join(__dirname, 'server');
execSync('npm install --production', { cwd: serverPath, stdio: 'pipe' });
import('./server/index.js');
