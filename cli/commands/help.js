import { fmt, symbols } from '../utils/colors.js';

export const commandHelp = () => {
  console.log(`
${symbols.sparkles} ${fmt.bold('Antigravity Creator Pulse CLI Automation Suite v12.0')}

${fmt.bold('USAGE:')}
  ${fmt.cyan('portfolio')} <command> [subcommand] [options]

${fmt.bold('AVAILABLE COMMANDS:')}
  ${fmt.bold('init')}                Check environment configuration, Node version, and server connections.
  ${fmt.bold('status')}              Run backend health checks, database status, API connections, and cron status.
  ${fmt.bold('sync')}                Trigger live metric synchronization across connected social platforms.
  ${fmt.bold('metrics')}             Display current aggregate metrics, total audience, views, and breakdown.
  ${fmt.bold('projects')}            Validate and list portfolio projects, categories, links, and featured status.
  ${fmt.bold('build')}               Build the production React frontend bundle with Vite.
  ${fmt.bold('dev')}                 Start server and client development servers.
  ${fmt.bold('deploy')}              Run health checks, build app, require confirmation, and push to GitHub.

${fmt.bold('AUTOMATED GIT WORKFLOW COMMANDS:')}
  ${fmt.bold('git status')}          Display colorized workspace status and changed files list.
  ${fmt.bold('git validate')}        Run backend syntax check, security tests, and frontend build validation.
  ${fmt.bold('git commit')}          Run full validation, generate automated commit message, and commit changes.
  ${fmt.bold('git push')}            Safely push local commits to current branch (no force pushes/deletions).

${fmt.bold('OPTIONS:')}
  ${fmt.bold('-m, --message')}       Custom commit message for git commit.
  ${fmt.bold('-y, --yes')}           Skip confirmation prompts for git commit/push (useful for CI/CD).
  ${fmt.bold('-h, --help')}          Show this help documentation.

${fmt.bold('EXAMPLES:')}
  ${fmt.cyan('$ portfolio git status')}       ${fmt.gray('# Check workspace status and changed files')}
  ${fmt.cyan('$ portfolio git validate')}     ${fmt.gray('# Run automated pre-commit validation checks')}
  ${fmt.cyan('$ portfolio git commit')}       ${fmt.gray('# Validate, prompt confirmation, and commit')}
  ${fmt.cyan('$ portfolio git push')}         ${fmt.gray('# Safely push commits to remote repository')}
`);
};
