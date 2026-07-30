const { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';

console.log('====================================================');
console.log('\uD83D\uDE80 Starting MediaShelf (Server + Client)...');
console.log('====================================================\n');

// On Windows, use `node` command name via shell so paths with spaces work correctly.
// shell: true is required on Windows for .cmd executables and paths with spaces.
const server = spawn('node', [`"${path.join(__dirname, 'server', 'server.js')}"`], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

server.on('error', (err) => {
  console.error('\u274C Server process error:', err.message);
});

server.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\u274C Server exited with code ${code}`);
  }
});

// Spawn Frontend Vite Client — shell: true required on Windows for npm
const client = spawn('npm', ['run', 'dev', '--prefix', 'client'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

client.on('error', (err) => {
  console.error('\u274C Client process error:', err.message);
});

const handleExit = () => {
  console.log('\nStopping all dev services...');
  try { server.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
