import { fmt, symbols } from '../utils/colors.js';
import { request } from '../utils/apiClient.js';

export const commandStatus = async () => {
  console.log(`\n${symbols.gear} ${fmt.bold('System Status & API Diagnostics')}\n`);

  const results = [];

  // 1. Health API Check
  try {
    const health = await request('/health');
    if (health.statusCode === 200 && health.data) {
      results.push(`Backend API Health: ${symbols.check} ${fmt.green('Operational (200 OK)')}`);
      const dbConnected = health.data.data?.database?.connected;
      results.push(`MongoDB Database:   ${dbConnected ? symbols.check + ' ' + fmt.green('Connected (' + health.data.data.database.name + ')') : symbols.warning + ' ' + fmt.yellow('Standalone / Mock Mode')}`);
      results.push(`Server Uptime:      ${fmt.cyan(Math.round(health.data.data?.uptime || 0) + 's')}`);
    } else {
      results.push(`Backend API Health: ${symbols.cross} ${fmt.red('Unresponsive')}`);
    }
  } catch (err) {
    results.push(`Backend API Health: ${symbols.cross} ${fmt.red('Offline (' + err.message + ')')}`);
  }

  // 2. Sync Status Check
  try {
    const sync = await request('/sync/status');
    if (sync.statusCode === 200 && sync.data) {
      results.push(`Sync Status:        ${symbols.check} ${fmt.green(sync.data.data?.syncStatus || 'IDLE')}`);
      results.push(`Last Sync Time:     ${fmt.cyan(sync.data.data?.lastSyncTimestamp ? new Date(sync.data.data.lastSyncTimestamp).toLocaleString() : 'N/A')}`);
    }
  } catch (err) {
    results.push(`Sync Status:        ${symbols.warning} ${fmt.yellow('Sync endpoint unreachable')}`);
  }

  // 3. Social Integration API Check
  try {
    const social = await request('/social');
    if (social.statusCode === 200 && social.data) {
      const platforms = social.data.data?.platforms || [];
      results.push(`Connected Platforms: ${symbols.check} ${fmt.green(platforms.length + ' active integrations')}`);
    }
  } catch (err) {
    results.push(`Social API Check:   ${symbols.warning} ${fmt.yellow('Social metrics route offline')}`);
  }

  console.log(fmt.box('CREATOR PULSE SYSTEM HEALTH DIAGNOSTICS', results));
  console.log(`\n${fmt.green('Status verification complete.')}\n`);
};
