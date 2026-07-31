const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('\uD83D\uDE80 Starting MediaShelf Dev (Server + Client)...');
console.log('====================================================\n');

let serverProc = null;
let clientProc = null;
let exiting = false;

function startServer() {
  serverProc = spawn('node', [path.join(__dirname, 'server', 'server.js')], {
    stdio: 'inherit',
    shell: false,
    env: { ...process.env }
  });

  serverProc.on('error', (err) => {
    console.error('\u274C Server process error:', err.message);
  });

  serverProc.on('exit', (code) => {
    if (!exiting) {
      console.log(`\u26A0\uFE0F  Server exited (code ${code}). Restarting in 2s...`);
      setTimeout(startServer, 2000);
    }
  });
}

function startClient() {
  clientProc = spawn('npm', ['run', 'dev', '--prefix', 'client'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });

  clientProc.on('error', (err) => {
    console.error('\u274C Client process error:', err.message);
  });

  clientProc.on('exit', (code) => {
    if (!exiting) {
      // Vite sometimes exits with code 1 on Windows due to shell warnings — restart it
      console.log(`\u26A0\uFE0F  Client exited (code ${code}). Restarting in 2s...`);
      setTimeout(startClient, 2000);
    }
  });
}

startServer();
startClient();

const handleExit = () => {
  if (exiting) return;
  exiting = true;
  console.log('\nStopping all dev services...');
  try { if (serverProc) serverProc.kill(); } catch (e) {}
  try { if (clientProc) clientProc.kill(); } catch (e) {}
  setTimeout(() => process.exit(0), 500);
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
// Keep the process alive
process.stdin.resume();
