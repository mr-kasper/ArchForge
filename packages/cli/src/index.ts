#!/usr/bin/env node
// ─────────────────────────────────────────────────────────
// ArchForge CLI — Entry Point
// ─────────────────────────────────────────────────────────

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { lintArchitectureCommand } from './commands/lint-architecture';
import { listCommand } from './commands/list';
import { banner } from './ui/banner';

const program = new Command();

program
  .name('archforge')
  .description('Universal Architecture Generator — generate production-ready project scaffolds')
  .version('1.0.0')
  .hook('preAction', () => {
    banner();
  });

// ── archforge init ──────────────────────────────────────
program
  .command('init')
  .description('Generate a new project with standardized architecture')
  .option('-n, --name <name>', 'Project name')
  .option('-s, --stack <stack>', 'Technology stack (react | java | dotnet)')
  .option(
    '-a, --architecture <arch>',
    'Architecture style (clean | layered | feature-based | hexagonal | ddd | feature-sliced | mvc | cqrs | microservices | modular-monolith)',
  )
  .option('-d, --database <db>', 'Database (postgresql | mysql | none)')
  .option('--auth <auth>', 'Authentication (jwt | oauth | none)')
  .option('-o, --output <dir>', 'Output directory')
  .action(initCommand);

// ── archforge lint-architecture ─────────────────────────
program
  .command('lint-architecture')
  .alias('lint-arch')
  .description('Validate an existing project against architecture rules')
  .option('-d, --dir <dir>', 'Project directory to validate', '.')
  .option(
    '-a, --architecture <arch>',
    'Architecture style (clean | layered | feature-based | hexagonal | ddd | feature-sliced | mvc | cqrs | microservices | modular-monolith)',
    'clean',
  )
  .action(lintArchitectureCommand);

// ── archforge list ──────────────────────────────────────
program.command('list').alias('ls').description('List all available templates').action(listCommand);

program.parse();
