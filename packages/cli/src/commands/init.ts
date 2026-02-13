// ─────────────────────────────────────────────────────────
// Command: archforge init
// ─────────────────────────────────────────────────────────

import chalk from 'chalk';
import boxen from 'boxen';
import { generateProject } from '@archforge/core-engine';
import { collectProjectConfig } from '../prompts/project-prompts';
import { createSpinner } from '../ui/spinner';

interface InitOptions {
  name?: string;
  stack?: string;
  architecture?: string;
  database?: string;
  auth?: string;
  output?: string;
}

export async function initCommand(options: InitOptions): Promise<void> {
  try {
    // 1. Collect configuration (interactive or flags)
    const config = await collectProjectConfig(options);

    console.log('');
    console.log(chalk.bold('📋 Project Configuration:'));
    console.log(chalk.dim('─'.repeat(40)));
    console.log(`  ${chalk.cyan('Name:')}          ${config.projectName}`);
    console.log(`  ${chalk.cyan('Stack:')}         ${config.stack}`);
    console.log(`  ${chalk.cyan('Architecture:')}  ${config.architecture}`);
    console.log(`  ${chalk.cyan('Database:')}      ${config.database}`);
    console.log(`  ${chalk.cyan('Auth:')}          ${config.auth}`);
    console.log(`  ${chalk.cyan('Tooling:')}       ${config.tooling.join(', ') || 'none'}`);
    console.log(`  ${chalk.cyan('Output:')}        ${config.outputDir}`);
    console.log('');

    // 2. Generate the project
    const spinner = createSpinner('Generating project architecture...');
    spinner.start();

    const result = await generateProject(config);

    if (!result.success) {
      spinner.fail('Generation failed');
      for (const err of result.errors) {
        console.log(chalk.red(`  ✖ ${err}`));
      }
      process.exit(1);
    }

    spinner.succeed(`Created ${result.filesCreated.length} files`);

    // 3. Show warnings
    for (const warning of result.warnings) {
      console.log(chalk.yellow(`  ⚠ ${warning}`));
    }

    // 4. Summary
    console.log('');
    console.log(
      boxen(
        [
          chalk.green.bold('✅ Project generated successfully!'),
          '',
          chalk.dim(`${result.filesCreated.length} files created in ${config.outputDir}`),
          '',
          ...result.postMessages.map((msg: string) => chalk.cyan(`  → ${msg}`)),
          '',
          chalk.dim('Run `archforge lint-architecture` to validate your architecture'),
        ].join('\n'),
        {
          padding: 1,
          margin: { top: 0, bottom: 1, left: 2, right: 2 },
          borderStyle: 'round',
          borderColor: 'green',
        },
      ),
    );
  } catch (err) {
    if ((err as { name?: string }).name === 'ExitPromptError') {
      console.log(chalk.dim('\nAborted.'));
      return;
    }
    console.error(chalk.red(`\nError: ${err instanceof Error ? err.message : err}`));
    process.exit(1);
  }
}
