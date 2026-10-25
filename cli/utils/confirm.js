import readline from 'readline';
import { fmt, symbols } from './colors.js';

/**
 * Require explicit user confirmation before executing potentially destructive CLI or Git actions
 */
export const requireConfirmation = async (actionTitle, commandLines = [], forceYes = false) => {
  if (forceYes) {
    console.log(`${symbols.info} Non-interactive mode active (--yes flag passed). Auto-confirming action.`);
    return true;
  }

  console.log(`\n${symbols.warning}  ${fmt.bold(actionTitle)}`);
  if (commandLines.length > 0) {
    console.log(`${fmt.gray('Commands to be executed:')}`);
    commandLines.forEach(cmd => {
      console.log(`   ${fmt.cyan('$')} ${fmt.bold(cmd)}`);
    });
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`\n${fmt.bold('Are you sure you want to proceed? (y/N): ')}`, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      const confirmed = normalized === 'y' || normalized === 'yes';
      if (!confirmed) {
        console.log(`${symbols.cross} Action cancelled by user.`);
      }
      resolve(confirmed);
    });
  });
};
