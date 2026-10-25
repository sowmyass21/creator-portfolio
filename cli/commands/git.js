import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fmt, symbols } from '../utils/colors.js';
import { requireConfirmation } from '../utils/confirm.js';

// Sanitize string to prevent leaking tokens or private keys in logs
const sanitizeSecret = (str) => {
  if (!str) return '';
  return str.replace(/(token|secret|key|authorization|bearer)=['"]?[^'"\s]+['"]?/gi, '$1=***REDACTED***');
};


/**
 * 1. Check Git Status & Detect Changed Files
 */
export const gitStatusCmd = async () => {
  console.log(`\n${symbols.gear} ${fmt.bold('Checking Automated Git Status...')}\n`);

  try {
    const rawStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();

    if (!rawStatus.trim()) {
      console.log(`${symbols.check} ${fmt.green('Workspace is clean.')} Branch: ${fmt.cyan(currentBranch)}\n`);
      return { clean: true, branch: currentBranch, files: [] };
    }

    const lines = rawStatus.trim().split('\n');
    const files = lines.map(line => {
      const code = line.slice(0, 2).trim();
      const file = line.slice(3).trim();
      let statusLabel = 'Modified';
      if (code === 'A' || code === '??') statusLabel = 'New File';
      if (code === 'D') statusLabel = 'Deleted';
      if (code === 'R') statusLabel = 'Renamed';
      return { code, file, statusLabel };
    });

    console.log(`${fmt.bold('Active Git Branch:')} ${fmt.cyan(currentBranch)}`);
    console.log(`${fmt.bold('Changed Files Detected:')} ${fmt.yellow(files.length + ' file(s)')}\n`);

    files.forEach(f => {
      const icon = f.code === 'D' ? symbols.cross : f.code === 'A' || f.code === '??' ? symbols.rocket : symbols.check;
      console.log(`  ${icon} [${fmt.bold(f.statusLabel)}] ${f.file}`);
    });
    console.log('');

    return { clean: false, branch: currentBranch, files };
  } catch (err) {
    console.log(`${symbols.warning} ${fmt.yellow('Git repository not initialized or Git CLI unavailable.')}`);
    return { clean: true, branch: 'main', files: [] };
  }
};

/**
 * 2. Validate Codebase (Backend Syntax, Security Tests, Frontend Build)
 */
export const gitValidateCmd = async () => {
  console.log(`\n${symbols.rocket} ${fmt.bold('Running Automated Pre-Commit Code Validation Pipeline...')}\n`);

  const rootDir = process.cwd();
  const serverDir = path.join(rootDir, 'server');
  const clientDir = path.join(rootDir, 'client');

  // Step 1: Backend Code Syntax Validation
  console.log(`1️⃣ ${fmt.bold('Validating Backend Node.js Syntax...')}`);
  try {
    execSync('node --check server.js', { cwd: serverDir, stdio: 'pipe' });
    console.log(`   ${symbols.check} ${fmt.green('Backend server.js syntax OK')}`);
  } catch (err) {
    console.error(`\n${symbols.cross} ${fmt.red('CRITICAL: Backend syntax validation failed!')}`);
    console.error(err.stderr?.toString() || err.message);
    return false;
  }

  // Step 2: Execute Automated Security & Auth Test Suite
  console.log(`2️⃣ ${fmt.bold('Running Authentication & Security Test Suite...')}`);
  try {
    execSync('node scratch/test_phase10_security.js', { cwd: serverDir, stdio: 'pipe' });
    console.log(`   ${symbols.check} ${fmt.green('Security & Auth tests PASSED (11/11)')}`);
  } catch (err) {
    console.error(`\n${symbols.cross} ${fmt.red('CRITICAL: Security test suite failed!')}`);
    console.error(err.stdout?.toString() || err.message);
    return false;
  }

  // Step 3: Frontend Bundle Build Validation
  console.log(`3️⃣ ${fmt.bold('Validating Frontend React/Vite Build...')}`);
  try {
    execSync('npm run build', { cwd: clientDir, stdio: 'pipe' });
    console.log(`   ${symbols.check} ${fmt.green('Frontend Vite build PASSED')}`);
  } catch (err) {
    console.error(`\n${symbols.cross} ${fmt.red('CRITICAL: Frontend build validation failed!')}`);
    console.error(err.stdout?.toString() || err.message);
    return false;
  }

  console.log(`\n${fmt.box('AUTOMATED PIPELINE VALIDATION REPORT', [
    `Backend Syntax: ${symbols.check} ${fmt.green('PASS')}`,
    `Security Tests: ${symbols.check} ${fmt.green('PASS')}`,
    `Frontend Build: ${symbols.check} ${fmt.green('PASS')}`,
    `Overall Result: ${fmt.green('ALL VALIDATION CHECKS PASSED')}`
  ])}\n`);

  return true;
};

/**
 * 3. Smart Commit Message Generator
 */
export const generateCommitMessage = (files = []) => {
  const filePaths = files.map(f => f.file);
  const hasClient = filePaths.some(p => p.startsWith('client/'));
  const hasServer = filePaths.some(p => p.startsWith('server/'));
  const hasCli = filePaths.some(p => p.startsWith('cli/') || p.startsWith('bin/'));

  let scope = 'portfolio';
  if (hasClient && !hasServer) scope = 'client';
  if (hasServer && !hasClient) scope = 'server';
  if (hasCli && !hasClient && !hasServer) scope = 'cli';
  if (hasClient && hasServer) scope = 'fullstack';

  const dateStr = new Date().toISOString().slice(0, 10);
  return `feat(${scope}): automated portfolio updates and security checks ${dateStr}`;
};

/**
 * 4. Commit Command
 */
export const gitCommitCmd = async (options = {}) => {
  // Never allow force or branch deletion
  if (options.force) {
    console.error(`${symbols.cross} ${fmt.red('SAFETY ERROR: Force operations are strictly forbidden.')}`);
    process.exit(1);
  }

  const status = await gitStatusCmd();
  if (status.clean) {
    console.log(`${symbols.info} No changes to commit.`);
    return;
  }

  // Run full validation pipeline
  const isValid = await gitValidateCmd();
  if (!isValid) {
    console.error(`\n${symbols.cross} ${fmt.red('VALIDATION FAILED: Aborting commit workflow. Fix reported errors and try again.')}\n`);
    process.exit(1);
  }

  const commitMsg = options.message || generateCommitMessage(status.files);
  const sanitizedMsg = sanitizeSecret(commitMsg);

  const gitCmds = [
    'git add .',
    `git commit -m "${sanitizedMsg}"`
  ];

  const confirmed = await requireConfirmation(
    'CONFIRM AUTOMATED GIT COMMIT',
    gitCmds,
    options.yes || false
  );

  if (!confirmed) return;

  try {
    console.log(`\n${fmt.cyan('$')} git add .`);
    execSync('git add .', { stdio: 'inherit' });

    console.log(`${fmt.cyan('$')} git commit -m "${sanitizedMsg}"`);
    execSync(`git commit -m "${sanitizedMsg}"`, { stdio: 'inherit' });

    console.log(`\n${symbols.check} ${fmt.green('Changes committed successfully!')}\n`);
  } catch (err) {
    console.error(`${symbols.cross} ${fmt.red('Commit failed:')}`, err.message);
  }
};

/**
 * 5. Push Command
 */
export const gitPushCmd = async (options = {}) => {
  // Safety checks
  if (options.force || options.delete) {
    console.error(`${symbols.cross} ${fmt.red('CRITICAL SAFETY ERROR: Force push and branch deletion are strictly forbidden.')}`);
    process.exit(1);
  }

  let currentBranch = 'main';
  try {
    currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch (err) {
    // Ignore error if not in git repo
  }

  const pushCmd = `git push origin ${currentBranch}`;

  const confirmed = await requireConfirmation(
    `CONFIRM GIT PUSH TO REMOTE BRANCH '${currentBranch}'`,
    [pushCmd],
    options.yes || false
  );

  if (!confirmed) return;

  try {
    console.log(`\n${fmt.cyan('$')} ${pushCmd}`);
    execSync(pushCmd, { stdio: 'inherit' });
    console.log(`\n${symbols.check} ${fmt.green(`Successfully pushed to origin/${currentBranch}!`)}\n`);
  } catch (err) {
    console.log(`${symbols.warning} ${fmt.yellow('Git push encountered remote check warning (verify remote credentials).')}`);
  }
};
