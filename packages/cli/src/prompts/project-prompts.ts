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
  getStackCategory,
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
        separator('Frontend'),
        { name: '⚛️  React          (TypeScript + Vite)', value: 'react' },
        { name: '▲  Next.js        (React + App Router + SSR)', value: 'nextjs' },
        { name: '🅰️  Angular        (TypeScript + Standalone Components)', value: 'angular' },
        { name: '💚 Vue.js         (Composition API + Vite)', value: 'vue' },
        separator('Backend'),
        { name: '🟢 Node.js        (Express + TypeScript)', value: 'nodejs' },
        { name: '☕ Java           (Spring Boot + Gradle)', value: 'java' },
        { name: '🔷 .NET           (ASP.NET Core 8 + C#)', value: 'dotnet' },
        { name: '🐍 Django         (Python + Django REST Framework)', value: 'django' },
        { name: '🐘 Laravel        (PHP 8.3 + Eloquent)', value: 'laravel' },
        separator('Mobile'),
        { name: '📱 React Native   (Expo + TypeScript)', value: 'react-native' },
        { name: '🦋 Flutter        (Dart + Riverpod)', value: 'flutter' },
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
        if (stack === 'react') {
          return [
            separator('Recommended'),
            {
              name: '🏛️  Clean Architecture   (Domain → Application → Infrastructure → Presentation)',
              value: 'clean',
            },
            {
              name: '📚 Layered              (Controller → Service → Repository → Model)',
              value: 'layered',
            },
            {
              name: '📦 Feature-based        (self-contained feature modules)',
              value: 'feature-based',
            },
            separator('Other patterns'),
            {
              name: '🍰 Feature-Sliced       (app / pages / features / entities / shared)',
              value: 'feature-sliced',
            },
          ];
        }

        if (stack === 'nextjs') {
          return [
            {
              name: '📦 Feature-based        (features/ with components, hooks, actions)',
              value: 'feature-based',
            },
            {
              name: '🍰 Feature-Sliced       (shared → entities → features → widgets → app)',
              value: 'feature-sliced',
            },
          ];
        }

        if (stack === 'angular') {
          return [
            {
              name: '📦 Feature-based        (feature modules with services & pages)',
              value: 'feature-based',
            },
            {
              name: '📚 Layered              (Presentation → Services → Data → Domain)',
              value: 'layered',
            },
          ];
        }

        if (stack === 'vue') {
          return [
            {
              name: '📦 Feature-based        (features/ with pages, composables, components)',
              value: 'feature-based',
            },
          ];
        }

        if (stack === 'nodejs') {
          return [
            separator('Recommended'),
            {
              name: '🏛️  Clean Architecture   (Domain → Application → Infrastructure → Presentation)',
              value: 'clean',
            },
            {
              name: '📚 Layered              (Controller → Service → Repository → Model)',
              value: 'layered',
            },
            {
              name: '🎯 MVC                  (Model-View-Controller + REST API)',
              value: 'mvc',
            },
            {
              name: '🧱 Modular Monolith     (isolated modules with public APIs)',
              value: 'modular-monolith',
            },
            separator('Advanced'),
            {
              name: '🔷 Hexagonal            (Ports & Adapters)',
              value: 'hexagonal',
            },
          ];
        }

        if (stack === 'django') {
          return [
            {
              name: '📚 Layered              (Views → Services → Repositories → Models)',
              value: 'layered',
            },
            {
              name: '🎯 MVC                  (Django MTV — Models → Templates → Views)',
              value: 'mvc',
            },
            {
              name: '🏛️  Clean Architecture   (Domain entities + repository interfaces)',
              value: 'clean',
            },
          ];
        }

        if (stack === 'laravel') {
          return [
            {
              name: '🎯 MVC                  (Models → Controllers + Routes)',
              value: 'mvc',
            },
            {
              name: '📚 Layered              (Controllers → Services → Repositories → Models)',
              value: 'layered',
            },
            {
              name: '🧱 Modular Monolith     (isolated modules with service providers)',
              value: 'modular-monolith',
            },
          ];
        }

        if (stack === 'react-native') {
          return [
            {
              name: '📦 Feature-based        (features/ with hooks, api, components)',
              value: 'feature-based',
            },
            {
              name: '🏛️  Clean Architecture   (Domain → Data → Presentation)',
              value: 'clean',
            },
          ];
        }

        if (stack === 'flutter') {
          return [
            {
              name: '🏛️  Clean Architecture   (Domain → Data → Presentation)',
              value: 'clean',
            },
            {
              name: '📚 Layered              (UI → Providers → Services → Models)',
              value: 'layered',
            },
          ];
        }

        // Java & .NET
        return [
          separator('Recommended — covers 90% of real codebases'),
          {
            name: '🏛️  Clean Architecture   (Domain → Application → Infrastructure → Presentation)',
            value: 'clean',
          },
          {
            name: '📚 Layered              (Controller → Service → Repository → Model)',
            value: 'layered',
          },
          {
            name: '🎯 MVC                  (Model-View-Controller + REST API)',
            value: 'mvc',
          },
          {
            name: '🧱 Modular Monolith     (isolated modules with public APIs & events)',
            value: 'modular-monolith',
          },
          separator('Advanced — situational, not baseline'),
          {
            name: '🔷 Hexagonal            (Ports & Adapters — Domain ↔ Ports ↔ Adapters)',
            value: 'hexagonal',
          },
          {
            name: '🧩 Domain-Driven Design (Aggregates, Entities, Value Objects, Events)',
            value: 'ddd',
          },
          {
            name: '⚡ CQRS                 (Command/Query Responsibility Segregation)',
            value: 'cqrs',
          },
          {
            name: '🌐 Microservices        (API Gateway + independent services + Docker)',
            value: 'microservices',
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

  const category = getStackCategory(stack);
  const isBackend = category === 'backend';
  const isFrontend = category === 'frontend';

  const dataSection = await inquirer.prompt([
    // Database — always show, but choices vary by stack
    {
      type: 'list',
      name: 'database',
      message: 'Database:',
      when: () => !overrides.database,
      choices: () => {
        if (isFrontend || category === 'mobile') {
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
        if (stack === 'nodejs') {
          return [
            { name: '🟢 Prisma            (type-safe ORM)', value: 'prisma' },
            { name: '🔷 TypeORM           (decorator-based ORM)', value: 'typeorm' },
            { name: '❌ None              (raw queries)', value: 'none' },
          ];
        }
        if (stack === 'django') {
          return [
            { name: '🐍 Django ORM        (built-in, batteries-included)', value: 'django-orm' },
            { name: '❌ None              (raw SQL)', value: 'none' },
          ];
        }
        if (stack === 'laravel') {
          return [
            { name: '🐘 Eloquent          (built-in Active Record ORM)', value: 'eloquent' },
            { name: '❌ None              (raw DB facade)', value: 'none' },
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
  if (isFrontend) {
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
        choices: () => {
          if (stack === 'angular') {
            return [
              { name: '🟣 NgRx              (Redux-inspired for Angular)', value: 'ngrx' },
              { name: '📦 Services only     (Angular DI, no extra deps)', value: 'none' },
            ];
          }
          if (stack === 'vue') {
            return [
              { name: '🍍 Pinia             (official Vue store)', value: 'pinia' },
              { name: '❌ None              (composables only)', value: 'none' },
            ];
          }
          // React & Next.js
          return [
            { name: '🐻 Zustand           (lightweight, hooks-based)', value: 'zustand' },
            { name: '🏪 Redux Toolkit     (feature-rich, widely adopted)', value: 'redux' },
            { name: '⚛️  Jotai             (atomic, minimal boilerplate)', value: 'jotai' },
            { name: '📦 React Context     (built-in, no extra deps)', value: 'context' },
            { name: '❌ None              (prop drilling / server state only)', value: 'none' },
          ];
        },
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
        if (
          stack === 'react' ||
          stack === 'nextjs' ||
          stack === 'vue' ||
          stack === 'react-native'
        ) {
          return [
            { name: '🛡️  Zod               (TypeScript-first schema validation)', value: 'zod' },
            { name: '❌ None', value: 'none' },
          ];
        }
        if (stack === 'angular') {
          return [{ name: '🅰️  Angular Forms      (built-in reactive validation)', value: 'none' }];
        }
        if (stack === 'nodejs') {
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
        if (stack === 'django') {
          return [
            { name: '🐍 DRF Serializers   (built-in Django REST validation)', value: 'none' },
          ];
        }
        if (stack === 'laravel') {
          return [{ name: '🐘 Laravel Validation (built-in request validation)', value: 'none' }];
        }
        if (stack === 'flutter') {
          return [
            { name: '🦋 Built-in          (Dart type system + form validators)', value: 'none' },
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
        if (
          stack === 'react' ||
          stack === 'nextjs' ||
          stack === 'vue' ||
          stack === 'nodejs' ||
          stack === 'react-native'
        ) {
          return [
            { name: '📦 npm               (default, widely supported)', value: 'npm' },
            { name: '🧶 Yarn              (faster installs, workspaces)', value: 'yarn' },
            { name: '⚡ pnpm              (disk-efficient, strict)', value: 'pnpm' },
          ];
        }
        if (stack === 'angular') {
          return [
            { name: '📦 npm               (Angular CLI default)', value: 'npm' },
            { name: '🧶 Yarn              (faster installs)', value: 'yarn' },
            { name: '⚡ pnpm              (disk-efficient)', value: 'pnpm' },
          ];
        }
        if (stack === 'java') {
          return [{ name: '🐘 Gradle            (default for Spring Boot)', value: 'gradle' }];
        }
        if (stack === 'dotnet') {
          return [{ name: '🔷 dotnet CLI        (default for .NET)', value: 'dotnet' }];
        }
        if (stack === 'django') {
          return [{ name: '🐍 pip / venv        (Python default)', value: 'pip' }];
        }
        if (stack === 'laravel') {
          return [{ name: '🐘 Composer          (PHP default)', value: 'composer' }];
        }
        if (stack === 'flutter') {
          return [{ name: '🦋 pub               (Dart default)', value: 'pub' }];
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
        if (stack === 'nodejs') {
          return [
            { name: '📝 Pino              (fast JSON logging)', value: 'pino' },
            { name: '📝 Winston           (versatile transport-based)', value: 'winston' },
            { name: '❌ None              (console only)', value: 'none' },
          ];
        }
        if (stack === 'django') {
          return [{ name: '📝 Python logging    (built-in stdlib)', value: 'none' }];
        }
        if (stack === 'laravel') {
          return [{ name: '📝 Monolog           (Laravel default)', value: 'none' }];
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
        if (isFrontend || stack === 'nodejs' || stack === 'react-native') {
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
      when: () => category !== 'mobile',
      default: () => {
        if (isBackend) return '8080';
        return '3000';
      },
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
