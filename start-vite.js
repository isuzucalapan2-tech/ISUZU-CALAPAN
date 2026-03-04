import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const vitePath = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');

const viteProcess = spawn('node', [vitePath, 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

viteProcess.on('error', (err) => {
  console.error('Failed to start Vite:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  viteProcess.kill();
  process.exit(0);
});
