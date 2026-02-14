// ─────────────────────────────────────────────────────────
// Banner — stylized ArchForge header
// ─────────────────────────────────────────────────────────

import chalk from 'chalk';
import gradient from 'gradient-string';

const LOGO = `
     _             _     _____                    
    / \\   _ __ ___| |__ |  ___|__  _ __ __ _  ___ 
   / _ \\ | '__/ __| '_ \\| |_ / _ \\| '__/ _\` |/ _ \\
  / ___ \\| | | (__| | | |  _| (_) | | | (_| |  __/
 /_/   \\_\\_|  \\___|_| |_|_|  \\___/|_|  \\__, |\\___|
                                        |___/      
`;

export function banner(): void {
  try {
    console.log(gradient.pastel.multiline(LOGO));
  } catch {
    console.log(chalk.cyan(LOGO));
  }
  console.log(chalk.dim('  Universal Architecture Generator — v1.1.0\n'));
}
