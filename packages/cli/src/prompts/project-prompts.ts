// ─────────────────────────────────────────────────────────
// Interactive Prompts — collects project configuration
// Rich, contextual prompts grouped by category.
// ─────────────────────────────────────────────────────────

import inquirer from 'inquirer';
import chalk from 'chalk';
import {
  Stack,
  ArchitectureStyle,
  DatabaseOption,
  AuthOption,
  ToolingOption,
  PackageManager,
  ApiStyle,
  CSSFramework,
  StateManagement,
  ORMChoice,
  LoggingFramework,
  ValidationLibrary,
  ProjectConfig,
} from '@archforge/core-engine';
import * as path from 'path';

// ── Override flags from CLI ─────────────────────────────

interface PromptOverrides {
  name?: string;
  stack?: string;
  architecture?: string;
  database?: string;
  auth?: string;
  output?: string;
}

// ── Helpers ─────────────────────────────────────────────

function separator(label: string) {
  return new inquirer.Separator(chalk.bold.cyan(`\n── ${label} ──`));
}

function heading(text: string): void {
  console.log('');
  console.log(chalk.bold.cyan(`  ┌─ ${text}`));
  console.log(chalk.dim.cyan('  │'));
}

// ── Main prompt flow ────────────────────────────────────

export async function collectProjectConfig(
  overrides: PromptOverrides = {},
): Promise<ProjectConfig> {
  // ────────────────────────────────────────────────────
  // Section 1: Project Basics
  // ────────────────────────────────────────────────────
  heading('Project Basics');

  const basics = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: 'my-project',
      when: () => !overrides.name,
      validate: (input: string) => {
        if (!/^[a-z0-9-]+$/.test(input))
          return 'Must be lowercase alphanumeric with hyphens only (e.g. my-app)';
        if (input.length < 2) return 'Must be at least 2 characters';
        if (input.length > 50) return 'Must be 50 characters or fewer';
        return true;
      },
    },
    {
      type: 'list',
      name: 'stack',
      message: 'Technology stack:',
      when: () => !overrides.stack,
      choices: [
        { name: '⚛️  React          (TypeScript + Vite)', value: 'react' },
        { name: '☕ Java           (Spring Boot + Gradle)', value: 'java' },
        { name: '🔷 .NET           (ASP.NET Core 8 + C#)', value: 'dotnet' },
      ],
    },
  ]);

  const projectName = overrides.name || basics.projectName;
  const stack = (overrides.stack || basics.stack) as Stack;

  // ────────────────────────────────────────────────────
  // Section 2: Architecture
  // ────────────────────────────────────────────────────
  heading('Architecture');

  const archSection = await inquirer.prompt([
    {
      type: 'list',
      name: 'architecture',
      message: 'Architecture style:',
      when: () => !overrides.architecture,
      choices: () => {
        const common = [
          {
            name: '🏛️  Clean Architecture   (Domain → Application → Infrastructure → Presentation)',
            value: 'clean',
          },
          {
            name: '📚 Layered              (Controller → Service → Repository → Model)',
            value: 'layered',
          },
        ];

        if (stack === 'react') {
          return [
            ...common,
            separator('React-specific'),
            {
              name: '📦 Feature-based        (self-contained feature modules)',
              value: 'feature-based',
            },
            {
              name: '🍰 Feature-Sliced       (app / pages / features / entities / shared)',
              value: 'feature-sliced',
            },
          ];
        }

        // Java & .NET
        return [
          ...common,
          separator('Advanced patterns'),
          {
            name: '🔷 Hexagonal            (Ports & Adapters — Domain ↔ Ports ↔ Adapters)',
            value: 'hexagonal',
          },
          {
            name: '🧩 Domain-Driven Design (Aggregates, Entities, Value Objects, Events)',
            value: 'ddd',
          },
          {
            name: '🎯 MVC                  (Model-View-Controller + REST API)',
            value: 'mvc',
          },
          separator('Distributed / Scalable'),
          {
            name: '⚡ CQRS                 (Command/Query Responsibility Segregation)',
            value: 'cqrs',
          },
          {
            name: '🌐 Microservices        (API Gateway + independent services + Docker)',
            value: 'microservices',
          },
          {
            name: '🧱 Modular Monolith     (isolated modules with public APIs & events)',
            value: 'modular-monolith',
          },
        ];
      },
    },
  ]);

  const architecture = (overrides.architecture || archSection.architecture) as ArchitectureStyle;

  // ────────────────────────────────────────────────────
  // Section 3: Data & API (contextual per stack)
  // ────────────────────────────────────────────────────
  heading('Data & API');

  const isBackend = stack === 'java' || stack === 'dotnet';

  const dataSection = await inquirer.prompt([
    // Database — always show, but choices vary by stack
    {
      type: 'list',
      name: 'database',
      message: 'Database:',
      when: () => !overrides.database,
      choices: () => {
        if (stack === 'react') {
          return [
            { name: '❌ None              (frontend only — calls external API)', value: 'none' },
            { name: '🍃 MongoDB           (via API layer)', value: 'mongodb' },
            { name: '🐘 PostgreSQL        (via API layer)', value: 'postgresql' },
          ];
        }
        return [
          { name: '🐘 PostgreSQL        (recommended for most projects)', value: 'postgresql' },
          { name: '🐬 MySQL             (wide hosting support)', value: 'mysql' },
          { name: '🍃 MongoDB           (document-oriented NoSQL)', value: 'mongodb' },
          { name: '📄 SQLite            (zero-config, file-based)', value: 'sqlite' },
          { name: '❌ None              (in-memory / bring your own)', value: 'none' },
        ];
      },
    },
    // ORM — show for backend when a database is selected
    {
      type: 'list',
      name: 'orm',
      message: 'ORM / Data Access:',
      when: (answers: Record<string, string>) => {
        const db = overrides.database || answers.database;
        return db !== 'none' && isBackend;
      },
      choices: () => {
        if (stack === 'java') {
          return [
            { name: '🟢 Hibernate / JPA   (default Spring Data)', value: 'hibernate' },
            { name: '❌ None              (raw JDBC / custom)', value: 'none' },
          ];
        }
        if (stack === 'dotnet') {
          return [
            { name: '🟢 Entity Framework  (EF Core 8)', value: 'ef-core' },
            { name: '❌ None              (raw ADO.NET / Dapper)', value: 'none' },
          ];
        }
        return [{ name: '❌ None', value: 'none' }];
      },
    },
    // API style — backend only
    {
      type: 'list',
      name: 'apiStyle',
      message: 'API style:',
      when: () => isBackend,
      choices: [
        { name: '🌐 REST              (standard JSON/HTTP endpoints)', value: 'rest' },
        { name: '📊 GraphQL           (flexible query language)', value: 'graphql' },
        { name: '⚡ gRPC              (high-performance binary protocol)', value: 'grpc' },
      ],
    },
  ]);

  // ────────────────────────────────────────────────────
  // Section 4: Frontend Options (React only)
  // ────────────────────────────────────────────────────
  let frontendSection: Record<string, string> = {};
  if (stack === 'react') {
    heading('Frontend Options');

    frontendSection = await inquirer.prompt([
      {
        type: 'list',
        name: 'cssFramework',
        message: 'CSS / Styling:',
        choices: [
          { name: '🎨 Tailwind CSS      (utility-first, most popular)', value: 'tailwind' },
          { name: '📦 CSS Modules       (scoped CSS, zero-runtime)', value: 'css-modules' },
          { name: '💅 Styled Components (CSS-in-JS)', value: 'styled-components' },
          { name: '🎀 Sass / SCSS       (classic preprocessor)', value: 'sass' },
          { name: '❌ None              (plain CSS)', value: 'none' },
        ],
      },
      {
        type: 'list',
        name: 'stateManagement',
        message: 'State management:',
        choices: [
          { name: '🐻 Zustand           (lightweight, hooks-based)', value: 'zustand' },
          { name: '🏪 Redux Toolkit     (feature-rich, widely adopted)', value: 'redux' },
          { name: '⚛️  Jotai             (atomic, minimal boilerplate)', value: 'jotai' },
          { name: '📦 React Context     (built-in, no extra deps)', value: 'context' },
          { name: '❌ None              (prop drilling / server state only)', value: 'none' },
        ],
      },
    ]);
  }

  // ────────────────────────────────────────────────────
  // Section 5: Security & Validation
  // ────────────────────────────────────────────────────
  heading('Security & Validation');

  const securitySection = await inquirer.prompt([
    {
      type: 'list',
      name: 'auth',
      message: 'Authentication:',
      when: () => !overrides.auth,
      choices: () => {
        return [
          { name: '🔑 JWT               (stateless token-based auth)', value: 'jwt' },
          { name: '🌐 OAuth 2.0         (Google, GitHub, etc.)', value: 'oauth' },
          { name: '🍪 Session-based     (server-side sessions)', value: 'session' },
          { name: '❌ None              (no auth scaffolding)', value: 'none' },
        ];
      },
    },
    {
      type: 'list',
      name: 'validation',
      message: 'Validation library:',
      choices: () => {
        if (stack === 'react') {
          return [
            { name: '🛡️  Zod               (TypeScript-first schema validation)', value: 'zod' },
            { name: '❌ None', value: 'none' },
          ];
        }
        if (stack === 'java') {
          return [
            {
              name: '☕ Bean Validation    (Jakarta @Valid annotations)',
              value: 'bean-validation',
            },
            { name: '❌ None', value: 'none' },
          ];
        }
        if (stack === 'dotnet') {
          return [
            { name: '🔷 FluentValidation  (.NET validation library)', value: 'fluent-validation' },
            { name: '❌ None', value: 'none' },
          ];
        }
        return [{ name: '❌ None', value: 'none' }];
      },
    },
  ]);

  // ────────────────────────────────────────────────────
  // Section 6: DevOps & Tooling
  // ────────────────────────────────────────────────────
  heading('DevOps & Tooling');

  const toolingSection = await inquirer.prompt([
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager:',
      choices: () => {
        if (stack === 'react') {
          return [
            { name: '📦 npm               (default, widely supported)', value: 'npm' },
            { name: '🧶 Yarn              (faster installs, workspaces)', value: 'yarn' },
            { name: '⚡ pnpm              (disk-efficient, strict)', value: 'pnpm' },
          ];
        }
        if (stack === 'java') {
          return [{ name: '🐘 Gradle            (default for Spring Boot)', value: 'gradle' }];
        }
        if (stack === 'dotnet') {
          return [{ name: '🔷 dotnet CLI        (default for .NET)', value: 'dotnet' }];
        }
        return [{ name: '📦 npm', value: 'npm' }];
      },
    },
    {
      type: 'list',
      name: 'logging',
      message: 'Logging framework:',
      when: () => isBackend,
      choices: () => {
        if (stack === 'java') {
          return [
            { name: '📝 SLF4J + Logback   (Spring Boot default)', value: 'slf4j' },
            { name: '❌ None              (System.out only)', value: 'none' },
          ];
        }
        if (stack === 'dotnet') {
          return [
            { name: '📝 Serilog           (structured logging)', value: 'serilog' },
            { name: '❌ None              (built-in ILogger only)', value: 'none' },
          ];
        }
        return [{ name: '❌ None', value: 'none' }];
      },
    },
    {
      type: 'checkbox',
      name: 'tooling',
      message: 'Extra tooling (space to toggle):',
      choices: () => {
        const base = [
          {
            name: '🐳 Docker            (Dockerfile + .dockerignore)',
            value: 'docker',
            checked: true,
          },
          { name: '🔄 CI/CD             (GitHub Actions workflow)', value: 'ci', checked: true },
          {
            name: '🧪 Tests             (pre-configured test setup)',
            value: 'tests',
            checked: true,
          },
        ];
        if (stack === 'react') {
          base.push(
            {
              name: '🔍 ESLint + Prettier (code quality & formatting)',
              value: 'linting',
              checked: true,
            },
            { name: '🐶 Husky + lint-staged (pre-commit hooks)', value: 'husky', checked: false },
          );
        }
        return base;
      },
    },
    {
      type: 'input',
      name: 'port',
      message: 'Server port:',
      when: () => isBackend,
      default: '8080',
      validate: (input: string) => {
        const n = parseInt(input, 10);
        if (isNaN(n) || n < 1 || n > 65535) return 'Must be a valid port (1–65535)';
        return true;
      },
    },
  ]);

  // ────────────────────────────────────────────────────
  // Section 7: Output
  // ────────────────────────────────────────────────────
  heading('Output');

  const outputSection = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputDir',
      message: 'Output directory:',
      when: () => !overrides.output,
      default: `./${projectName}`,
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Generate project with these settings?',
      default: true,
    },
  ]);

  if (!outputSection.confirm) {
    throw Object.assign(new Error('Aborted by user'), { name: 'ExitPromptError' });
  }

  // ── Assemble final config ─────────────────────────
  return {
    projectName,
    stack,
    architecture,
    database: (overrides.database || dataSection.database || 'none') as DatabaseOption,
    auth: (overrides.auth || securitySection.auth || 'none') as AuthOption,
    tooling: (toolingSection.tooling || []) as ToolingOption[],
    outputDir: path.resolve(overrides.output || outputSection.outputDir),
    packageManager: (toolingSection.packageManager || 'npm') as PackageManager,
    apiStyle: (dataSection.apiStyle || 'none') as ApiStyle,
    cssFramework: (frontendSection.cssFramework || 'none') as CSSFramework,
    stateManagement: (frontendSection.stateManagement || 'none') as StateManagement,
    orm: (dataSection.orm || 'none') as ORMChoice,
    logging: (toolingSection.logging || 'none') as LoggingFramework,
    validation: (securitySection.validation || 'none') as ValidationLibrary,
    port: parseInt(toolingSection.port || '8080', 10),
  };
}
