// ─────────────────────────────────────────────────────────
// Command: archforge list
// ─────────────────────────────────────────────────────────

import chalk from 'chalk';
import { listAvailableTemplates } from '@archforge/core-engine';

export async function listCommand(): Promise<void> {
  const templates = listAvailableTemplates();

  console.log('');
  console.log(chalk.bold('📦 Available Templates'));
  console.log(chalk.dim('─'.repeat(40)));
  console.log('');

  const grouped: Record<string, string[]> = {};
  for (const tpl of templates) {
    if (!grouped[tpl.stack]) grouped[tpl.stack] = [];
    grouped[tpl.stack].push(tpl.architecture);
  }

  const stackLabels: Record<string, string> = {
    react: '⚛️  React',
    java: '☕ Java',
    dotnet: '🔷 .NET',
  };

  for (const [stack, architectures] of Object.entries(grouped)) {
    console.log(`  ${stackLabels[stack] || stack}`);
    for (const arch of architectures) {
      console.log(chalk.cyan(`    • ${arch}`));
    }
    console.log('');
  }

  console.log(chalk.dim('  Run `archforge init` to generate a project\n'));
}
