import fs from 'fs';
import path from 'path';
import { fmt, symbols } from '../utils/colors.js';
import { request } from '../utils/apiClient.js';

export const commandInit = async (options = {}) => {
  console.log(`\n${symbols.rocket} ${fmt.bold('Initializing CreatorPulse Portfolio Environment')}`);
  console.log(`${fmt.gray('Checking environment variables, folder structures, and API availability...\n')}`);

  const rootDir = process.cwd();
  const serverEnvPath = path.join(rootDir, 'server', '.env');
  const clientEnvPath = path.join(rootDir, 'client', '.env');

  const checks = [];

  // Check 1: Server .env
  if (fs.existsSync(serverEnvPath)) {
    checks.push(`${symbols.check} Server .env configuration file exists (${fmt.gray('server/.env')})`);
  } else {
    checks.push(`${symbols.cross} Server .env missing at ${fmt.gray('server/.env')}`);
  }

  // Check 2: Client .env
  if (fs.existsSync(clientEnvPath)) {
    checks.push(`${symbols.check} Client .env configuration file exists (${fmt.gray('client/.env')})`);
  } else {
    checks.push(`${symbols.cross} Client .env missing at ${fmt.gray('client/.env')}`);
  }

  // Check 3: Node & Package versions
  checks.push(`${symbols.check} Node.js runtime: ${fmt.bold(process.version)}`);

  // Check 4: Backend API connectivity
  try {
    const health = await request('/health');
    if (health.statusCode === 200) {
      checks.push(`${symbols.check} Backend API connected at ${fmt.cyan('http://localhost:5000/api')}`);
    } else {
      checks.push(`${symbols.warning} Backend API returned status ${health.statusCode}`);
    }
  } catch (err) {
    checks.push(`${symbols.warning} Backend API offline (Run ${fmt.bold('portfolio dev')} to start backend)`);
  }

  console.log(fmt.box('ENVIRONMENT INITIALIZATION STATUS', checks));
  console.log(`\n${fmt.green('Initialization check complete.')}\n`);
};
