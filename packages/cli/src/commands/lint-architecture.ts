// ─────────────────────────────────────────────────────────
// Command: archforge lint-architecture
// ─────────────────────────────────────────────────────────

import chalk from 'chalk';
import * as path from 'path';
import { validateArchitecture, ArchitectureStyle } from '@archforge/core-engine';
import { createSpinner } from '../ui/spinner';

interface LintOptions {
  dir: string;
  architecture: string;
}

export async function lintArchitectureCommand(options: LintOptions): Promise<void> {
  const projectDir = path.resolve(options.dir);
  const architecture = options.architecture as ArchitectureStyle;

  console.log('');
  console.log(chalk.bold('🔍 Architecture Validation'));
  console.log(chalk.dim('─'.repeat(40)));
  console.log(`  ${chalk.cyan('Directory:')}     ${projectDir}`);
  console.log(`  ${chalk.cyan('Architecture:')}  ${architecture}`);
  console.log('');

  const spinner = createSpinner('Scanning project files...');
  spinner.start();

  try {
    const violations = await validateArchitecture(projectDir, architecture);

    if (violations.length === 0) {
      spinner.succeed('No architecture violations found');
      console.log('');
      console.log(chalk.green('  ✅ Your project follows the architecture rules correctly.'));
      console.log('');
      return;
    }

    spinner.warn(`Found ${violations.length} violation(s)`);
    console.log('');

    const errors = violations.filter((v: { severity: string }) => v.severity === 'error');
    const warnings = violations.filter((v: { severity: string }) => v.severity === 'warning');

    if (errors.length > 0) {
      console.log(chalk.red.bold(`  Errors (${errors.length}):`));
      for (const v of errors) {
        console.log(chalk.red(`    ✖ [${v.ruleId}] ${v.message}`));
        console.log(chalk.dim(`      ${v.file}`));
      }
      console.log('');
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow.bold(`  Warnings (${warnings.length}):`));
      for (const v of warnings) {
        console.log(chalk.yellow(`    ⚠ [${v.ruleId}] ${v.message}`));
        console.log(chalk.dim(`      ${v.file}`));
      }
      console.log('');
    }

    if (errors.length > 0) {
      process.exit(1);
    }
  } catch (err) {
    spinner.fail('Validation failed');
    console.error(chalk.red(`\nError: ${err instanceof Error ? err.message : err}`));
    process.exit(1);
  }
}
