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
    console.log(chalk.dim('─'.repeat(45)));
    console.log(`  ${chalk.cyan('Name:')}            ${config.projectName}`);
    console.log(`  ${chalk.cyan('Stack:')}           ${config.stack}`);
    console.log(`  ${chalk.cyan('Architecture:')}    ${config.architecture}`);
    console.log(`  ${chalk.cyan('Database:')}        ${config.database}`);
    if (config.orm && config.orm !== 'none') {
      console.log(`  ${chalk.cyan('ORM:')}             ${config.orm}`);
    }
    if (config.apiStyle && config.apiStyle !== 'none') {
      console.log(`  ${chalk.cyan('API Style:')}       ${config.apiStyle}`);
    }
    if (config.cssFramework && config.cssFramework !== 'none') {
      console.log(`  ${chalk.cyan('CSS Framework:')}   ${config.cssFramework}`);
    }
    if (config.stateManagement && config.stateManagement !== 'none') {
      console.log(`  ${chalk.cyan('State Mgmt:')}      ${config.stateManagement}`);
    }
    console.log(`  ${chalk.cyan('Auth:')}            ${config.auth}`);
    if (config.validation && config.validation !== 'none') {
      console.log(`  ${chalk.cyan('Validation:')}      ${config.validation}`);
    }
    if (config.logging && config.logging !== 'none') {
      console.log(`  ${chalk.cyan('Logging:')}         ${config.logging}`);
    }
    console.log(`  ${chalk.cyan('Pkg Manager:')}     ${config.packageManager || 'npm'}`);
    console.log(`  ${chalk.cyan('Tooling:')}         ${config.tooling.join(', ') || 'none'}`);
    if (config.port && (config.stack === 'java' || config.stack === 'dotnet')) {
      console.log(`  ${chalk.cyan('Port:')}            ${config.port}`);
    }
    console.log(`  ${chalk.cyan('Output:')}          ${config.outputDir}`);
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
