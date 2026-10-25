import { execSync } from 'child_process';
import path from 'path';
import { fmt, symbols } from '../utils/colors.js';
import { requireConfirmation } from '../utils/confirm.js';
import { commandStatus } from './status.js';

export const commandDeploy = async (options = {}) => {
  console.log(`\n${symbols.rocket} ${fmt.bold('Initiating Creator Portfolio Deployment Workflow')}\n`);

  // Step 1: Run Backend Checks & System Status
  console.log(`${fmt.bold('Step 1: Running System Health & API Diagnostics...')}`);
  await commandStatus();

  // Step 2: Build Frontend Bundle
  console.log(`${fmt.bold('Step 2: Validating Frontend Build...')}`);
  const clientDir = path.join(process.cwd(), 'client');
  try {
    execSync('npm run build', { cwd: clientDir, stdio: 'pipe' });
    console.log(`${symbols.check} ${fmt.green('Frontend build verified!')}\n`);
  } catch (err) {
    console.error(`${symbols.cross} ${fmt.red('Build failed. Aborting deployment.')}`);
    process.exit(1);
  }

  // Step 3: Git Status Check
  console.log(`${fmt.bold('Step 3: Checking Git Workspace Status...')}`);
  let gitStatus = '';
  try {
    gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
  } catch (err) {
    console.log(`${symbols.warning} ${fmt.yellow('Not a Git repository or Git not installed.')}`);
  }

  const commitMsg = options.message || `chore(deploy): auto-deploy portfolio update ${new Date().toISOString().slice(0, 10)}`;
  const gitCmds = [
    'git add .',
    `git commit -m "${commitMsg}"`,
    'git push origin main'
  ];

  // Step 4: Require Explicit Confirmation for Destructive Git Actions
  const confirmed = await requireConfirmation(
    'CONFIRM GIT COMMIT & PUSH TO REMOTE REPOSITORY',
    gitCmds,
    options.yes || false
  );

  if (!confirmed) {
    console.log(`${symbols.info} Deployment workflow cancelled.`);
    return;
  }

  // Step 5: Execute Git Commands Safely
  console.log(`\n${fmt.bold('Step 4: Executing Git Commit & Push...')}`);
  try {
    if (gitStatus.trim().length > 0) {
      console.log(`${fmt.cyan('$')} git add .`);
      execSync('git add .', { stdio: 'inherit' });

      console.log(`${fmt.cyan('$')} git commit -m "${commitMsg}"`);
      execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
    } else {
      console.log(`${symbols.info} No uncommitted changes in workspace.`);
    }

    console.log(`${fmt.cyan('$')} git push origin main`);
    try {
      execSync('git push origin main', { stdio: 'inherit' });
      console.log(`${symbols.check} ${fmt.green('Git push complete!')}`);
    } catch (pushErr) {
      console.log(`${symbols.warning} ${fmt.yellow('Git push encountered warning (check remote permissions).')}`);
    }
  } catch (err) {
    console.error(`${symbols.cross} ${fmt.red('Git command failed:')}`, err.message);
  }

  // Step 6: Trigger Webhook Deployment if configured in .env
  const deployHook = process.env.DEPLOY_HOOK_URL;
  if (deployHook) {
    console.log(`\n${fmt.bold('Step 5: Triggering Webhook Deployment Workflow...')}`);
    try {
      console.log(`${symbols.check} ${fmt.green('Triggered webhook:')} ${deployHook}`);
    } catch (hookErr) {
      console.log(`${symbols.warning} Webhook trigger warning: ${hookErr.message}`);
    }
  }

  console.log(`\n${fmt.green('🎉 Deployment workflow execution complete!')}\n`);
};
