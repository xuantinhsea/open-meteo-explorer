// Workaround: npm 11 on Windows sometimes fails to extract leaflet's dist folder.
// This script ensures the dist files are present after npm install.
const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'node_modules', 'leaflet', 'dist');
if (existsSync(distPath)) process.exit(0);

console.log('[postinstall] leaflet dist missing — extracting from tarball…');
try {
  const tgz = execSync('npm pack leaflet@1.9.4 2>/dev/null || npm pack leaflet@1.9.4', { encoding: 'utf8' }).trim().split('\n').pop().trim();
  execSync(`tar -xzf ${tgz} -C node_modules/leaflet --strip-components=1 package/dist`, { stdio: 'inherit' });
  execSync(`rm -f ${tgz}`);
  console.log('[postinstall] leaflet dist extracted successfully.');
} catch (e) {
  console.warn('[postinstall] Could not auto-fix leaflet dist:', e.message);
  console.warn('[postinstall] Run manually: npm pack leaflet@1.9.4 && tar -xzf leaflet-1.9.4.tgz -C node_modules/leaflet --strip-components=1 package/dist && rm leaflet-1.9.4.tgz');
}
