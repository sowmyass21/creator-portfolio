import { execSync } from 'child_process';
import path from 'path';
import { fmt, symbols } from '../utils/colors.js';

export const commandBuild = async () => {
  console.log(`\n${symbols.rocket} ${fmt.bold('Building Creator Portfolio Frontend Bundle...')}\n`);
  
  const clientDir = path.join(process.cwd(), 'client');

  try {
    console.log(`${fmt.cyan('$')} npm run build (in client directory)`);
    const output = execSync('npm run build', {
      cwd: clientDir,
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    console.log(output);
    console.log(`${symbols.check} ${fmt.green('Frontend build completed successfully!')}\n`);
  } catch (err) {
    console.error(`${symbols.cross} ${fmt.red('Frontend build failed with error:')}`);
    console.error(err.stdout || err.stderr || err.message);
    process.exit(1);
  }
};
