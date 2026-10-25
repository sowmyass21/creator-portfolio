/**
 * ANSI Escape Code Terminal Color & Formatting Helper
 */

export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // Bright colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
};

export const symbols = {
  check: `${colors.green}✓${colors.reset}`,
  cross: `${colors.red}✗${colors.reset}`,
  warning: `${colors.yellow}⚠️${colors.reset}`,
  info: `${colors.cyan}ℹ${colors.reset}`,
  rocket: '🚀',
  sparkles: '✨',
  gear: '⚙️',
  lock: '🔒',
  bar: '│',
  cornerTL: '╭',
  cornerTR: '╮',
  cornerBL: '╰',
  cornerBR: '╯',
  dash: '─',
};

export const fmt = {
  bold: (str) => `${colors.bold}${str}${colors.reset}`,
  green: (str) => `${colors.green}${str}${colors.reset}`,
  red: (str) => `${colors.red}${str}${colors.reset}`,
  yellow: (str) => `${colors.yellow}${str}${colors.reset}`,
  cyan: (str) => `${colors.cyan}${str}${colors.reset}`,
  magenta: (str) => `${colors.magenta}${str}${colors.reset}`,
  gray: (str) => `${colors.gray}${str}${colors.reset}`,
  dim: (str) => `${colors.dim}${str}${colors.reset}`,
  
  box: (title, lines) => {
    const width = Math.max(title.length + 4, ...lines.map(l => l.replace(/\x1b\[[0-9;]*m/g, '').length + 4), 50);
    const top = `${colors.cyan}${symbols.cornerTL}${symbols.dash.repeat(width - 2)}${symbols.cornerTR}${colors.reset}`;
    const bottom = `${colors.cyan}${symbols.cornerBL}${symbols.dash.repeat(width - 2)}${symbols.cornerBR}${colors.reset}`;
    const headerLine = `${colors.cyan}${symbols.bar}${colors.reset} ${fmt.bold(title)} ${' '.repeat(width - title.length - 4)}${colors.cyan}${symbols.bar}${colors.reset}`;
    const separator = `${colors.cyan}${symbols.bar}${symbols.dash.repeat(width - 2)}${symbols.bar}${colors.reset}`;
    
    const bodyLines = lines.map(line => {
      const rawLen = line.replace(/\x1b\[[0-9;]*m/g, '').length;
      const padding = Math.max(0, width - rawLen - 4);
      return `${colors.cyan}${symbols.bar}${colors.reset} ${line}${' '.repeat(padding)} ${colors.cyan}${symbols.bar}${colors.reset}`;
    });

    return [top, headerLine, separator, ...bodyLines, bottom].join('\n');
  }
};
