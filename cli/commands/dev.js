import { spawn } from 'child_process';
import path from 'path';
import { fmt, symbols } from '../utils/colors.js';

export const commandDev = async () => {
  console.log(`\n${symbols.rocket} ${fmt.bold('Starting CreatorPulse Development Servers...')}\n`);
  console.log(`  ${symbols.check} Server API: ${fmt.cyan('http://localhost:5000')}`);
  console.log(`  ${symbols.check} Client App:  ${fmt.cyan('http://localhost:5173')}\n`);

  const rootDir = process.cwd();

  // Run dev:server and dev:client concurrently using npm scripts
  const devProc = spawn('npm', ['run', 'dev:server'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  devProc.on('error', (err) => {
    console.error(`${symbols.cross} ${fmt.red('Failed to start development server:')}`, err.message);
  });
};
