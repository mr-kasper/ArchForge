// ─────────────────────────────────────────────────────────
// Interactive Prompts — collects project configuration
// ─────────────────────────────────────────────────────────

import inquirer from 'inquirer';
import {
  Stack,
  ArchitectureStyle,
  DatabaseOption,
  AuthOption,
  ToolingOption,
  ProjectConfig,
} from '@archforge/core-engine';
import * as path from 'path';

interface PromptOverrides {
  name?: string;
  stack?: string;
  architecture?: string;
  database?: string;
  auth?: string;
  output?: string;
}

export async function collectProjectConfig(
  overrides: PromptOverrides = {},
): Promise<ProjectConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: 'my-project',
      when: () => !overrides.name,
      validate: (input: string) => {
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Project name must be lowercase alphanumeric with hyphens only';
        }
        return true;
      },
    },
    {
      type: 'list',
      name: 'stack',
      message: 'Technology stack:',
      when: () => !overrides.stack,
      choices: [
        { name: '⚛️  React (TypeScript + Vite)', value: 'react' },
        { name: '☕ Java (Spring Boot + Gradle)', value: 'java' },
        { name: '🔷 .NET (ASP.NET Core 8 + C#)', value: 'dotnet' },
      ],
    },
    {
      type: 'list',
      name: 'architecture',
      message: 'Architecture style:',
      when: () => !overrides.architecture,
      choices: (answers: Record<string, string>) => {
        const stack = overrides.stack || answers.stack;

        // Base architectures available for all stacks
        const choices: Array<{ name: string; value: string }> = [
          {
            name: '🏛️  Clean Architecture (Domain → Application → Infrastructure → Presentation)',
            value: 'clean',
          },
          {
            name: '📚 Layered Architecture (Controller → Service → Repository → Model)',
            value: 'layered',
          },
        ];

        // React-only architectures
        if (stack === 'react') {
          choices.push({
            name: '📦 Feature-based (self-contained feature modules)',
            value: 'feature-based',
          });
          choices.push({
            name: '🍰 Feature-Sliced Design (app/pages/features/entities/shared layers)',
            value: 'feature-sliced',
          });
        }

        // Backend-only architectures (Java + .NET)
        if (stack === 'java' || stack === 'dotnet') {
          choices.push({
            name: '🔷 Hexagonal / Ports & Adapters (Domain ↔ Ports ↔ Adapters)',
            value: 'hexagonal',
          });
          choices.push({
            name: '🧩 Domain-Driven Design (Aggregates, Entities, Value Objects, Events)',
            value: 'ddd',
          });
          choices.push({
            name: '🎯 MVC (Model-View-Controller with REST API + server views)',
            value: 'mvc',
          });
          choices.push({
            name: '⚡ CQRS (Command/Query Responsibility Segregation)',
            value: 'cqrs',
          });
          choices.push({
            name: '🌐 Microservices (API Gateway + independent services + Docker Compose)',
            value: 'microservices',
          });
          choices.push({
            name: '🧱 Modular Monolith (isolated modules with public APIs & event bus)',
            value: 'modular-monolith',
          });
        }

        return choices;
      },
    },
    {
      type: 'list',
      name: 'database',
      message: 'Database:',
      when: () => !overrides.database,
      choices: [
        { name: '🐘 PostgreSQL', value: 'postgresql' },
        { name: '🐬 MySQL', value: 'mysql' },
        { name: '❌ None', value: 'none' },
      ],
    },
    {
      type: 'list',
      name: 'auth',
      message: 'Authentication:',
      when: () => !overrides.auth,
      choices: [
        { name: '🔑 JWT', value: 'jwt' },
        { name: '🌐 OAuth', value: 'oauth' },
        { name: '❌ None', value: 'none' },
      ],
    },
    {
      type: 'checkbox',
      name: 'tooling',
      message: 'Tooling (select all that apply):',
      choices: [
        { name: '🐳 Docker (Dockerfile + .dockerignore)', value: 'docker', checked: true },
        { name: '🔄 CI/CD (GitHub Actions)', value: 'ci', checked: true },
        { name: '🧪 Tests (pre-configured test setup)', value: 'tests', checked: true },
      ],
    },
    {
      type: 'input',
      name: 'outputDir',
      message: 'Output directory:',
      when: () => !overrides.output,
      default: (answers: Record<string, string>) => {
        const name = overrides.name || answers.projectName || 'my-project';
        return `./${name}`;
      },
    },
  ]);

  return {
    projectName: overrides.name || answers.projectName,
    stack: (overrides.stack || answers.stack) as Stack,
    architecture: (overrides.architecture || answers.architecture) as ArchitectureStyle,
    database: (overrides.database || answers.database) as DatabaseOption,
    auth: (overrides.auth || answers.auth) as AuthOption,
    tooling: (answers.tooling || []) as unknown as ToolingOption[],
    outputDir: path.resolve(overrides.output || answers.outputDir),
  };
}
