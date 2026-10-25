#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { commandInit } from '../cli/commands/init.js';
import { commandStatus } from '../cli/commands/status.js';
import { commandSync } from '../cli/commands/sync.js';
import { commandMetrics } from '../cli/commands/metrics.js';
import { commandProjects } from '../cli/commands/projects.js';
import { commandBuild } from '../cli/commands/build.js';
import { commandDev } from '../cli/commands/dev.js';
import { commandDeploy } from '../cli/commands/deploy.js';
import { commandHelp } from '../cli/commands/help.js';
import { 
  gitStatusCmd, gitValidateCmd, gitCommitCmd, gitPushCmd 
} from '../cli/commands/git.js';
import { fmt, symbols } from '../cli/utils/colors.js';

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : 'help';

// Extract flags
const flags = {
  yes: process.argv.some(a => a === '-y' || a === '--yes' || a === 'yes' || a.includes('yes')),
  help: process.argv.some(a => a === '-h' || a === '--help' || a === 'help'),
  message: (() => {
    const msgIdx = process.argv.findIndex(a => a === '-m' || a === '--message');
    return msgIdx !== -1 && process.argv[msgIdx + 1] ? process.argv[msgIdx + 1] : null;
  })()
};


async function main() {
  if (flags.help && command !== 'help' && command !== 'git') {
    commandHelp();
    return;
  }

  switch (command) {
    case 'init':
      await commandInit(flags);
      break;

    case 'status':
      await commandStatus(flags);
      break;

    case 'sync':
      await commandSync(flags);
      break;

    case 'metrics':
      await commandMetrics(flags);
      break;

    case 'projects':
      await commandProjects(flags);
      break;

    case 'build':
      await commandBuild(flags);
      break;

    case 'dev':
      await commandDev(flags);
      break;

    case 'deploy':
      await commandDeploy(flags);
      break;

    case 'git': {
      const sub = args[1] ? args[1].toLowerCase() : 'status';
      if (sub === 'status') {
        await gitStatusCmd();
      } else if (sub === 'validate') {
        const ok = await gitValidateCmd();
        process.exit(ok ? 0 : 1);
      } else if (sub === 'commit') {
        await gitCommitCmd(flags);
      } else if (sub === 'push') {
        await gitPushCmd(flags);
      } else {
        console.error(`\n${symbols.cross} ${fmt.red(`Unknown portfolio git subcommand '${sub}'`)}`);
        console.log(`Available: ${fmt.cyan('portfolio git status')} | ${fmt.cyan('portfolio git validate')} | ${fmt.cyan('portfolio git commit')} | ${fmt.cyan('portfolio git push')}\n`);
        process.exit(1);
      }
      break;
    }

    case 'help':
    case '--help':
    case '-h':
      commandHelp();
      break;

    default:
      console.error(`\n${symbols.cross} ${fmt.red(`Unknown CLI command '${command}'`)}`);
      commandHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\n${symbols.cross} ${fmt.red('CLI Execution Error:')}`, err.message);
  process.exit(1);
});
