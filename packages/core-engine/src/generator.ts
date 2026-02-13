// ─────────────────────────────────────────────────────────
// Project Generator — orchestrates template selection,
// rendering, and architecture rule configuration.
// ─────────────────────────────────────────────────────────

import * as path from 'path';
import * as fs from 'fs-extra';
import chalk from 'chalk';
import { ProjectConfig, GenerationResult, TemplateFile, TemplateManifest } from './types';
import { renderAllTemplates } from './template-engine';
import { getTemplateManifest } from './template-registry';

/**
 * Generate a complete project from a ProjectConfig.
 */
export async function generateProject(config: ProjectConfig): Promise<GenerationResult> {
  const result: GenerationResult = {
    success: false,
    filesCreated: [],
    warnings: [],
    errors: [],
    postMessages: [],
  };

  try {
    // 1. Ensure output directory exists
    await fs.ensureDir(config.outputDir);

    // 2. Fetch the template manifest
    const manifest = getTemplateManifest(config.stack, config.architecture);
    if (!manifest) {
      result.errors.push(
        `No template found for stack="${config.stack}" architecture="${config.architecture}"`,
      );
      return result;
    }

    // 3. Collect all template files (base + tooling add-ons)
    const templates: TemplateFile[] = [...manifest.files];

    // Add Docker files if requested
    if (config.tooling.includes('docker')) {
      templates.push(...getDockerTemplates(config));
    }

    // Add CI files if requested
    if (config.tooling.includes('ci')) {
      templates.push(...getCITemplates(config));
    }

    // Add test scaffolding if requested
    if (config.tooling.includes('tests')) {
      templates.push(...getTestTemplates(config));
    }

    // 4. Render all templates
    const created = await renderAllTemplates(templates, config);
    result.filesCreated = created;

    // 5. Post messages
    if (manifest.postMessages) {
      result.postMessages = manifest.postMessages;
    }

    result.success = true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    result.errors.push(message);
  }

  return result;
}

// ── Tooling add-on templates ────────────────────────────

function getDockerTemplates(config: ProjectConfig): TemplateFile[] {
  const templates: TemplateFile[] = [];

  if (config.stack === 'react') {
    templates.push({
      path: 'Dockerfile',
      content: `# ── ArchForge: React Dockerfile ──
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`,
    });
  } else if (config.stack === 'java') {
    templates.push({
      path: 'Dockerfile',
      content: `# ── ArchForge: Java Dockerfile ──
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN ./gradlew bootJar

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
`,
    });
  } else if (config.stack === 'dotnet') {
    templates.push({
      path: 'Dockerfile',
      content: `# ── ArchForge: .NET Dockerfile ──
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "<%= projectName %>.dll"]
`,
    });
  }

  templates.push({
    path: '.dockerignore',
    content: `node_modules
dist
.git
*.md
.env
`,
  });

  return templates;
}

function getCITemplates(config: ProjectConfig): TemplateFile[] {
  return [
    {
      path: '.github/workflows/ci.yml',
      content: `# ── ArchForge: CI Pipeline ──
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
<% if (stack === 'react') { %>
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run build
<% } else if (stack === 'java') { %>
      - uses: actions/setup-java@v4
        with:
          java-version: 21
          distribution: temurin
      - run: ./gradlew check
      - run: ./gradlew build
<% } else if (stack === 'dotnet') { %>
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 8.0.x
      - run: dotnet restore
      - run: dotnet build --no-restore
      - run: dotnet test --no-build
<% } %>
`,
    },
  ];
}

function getTestTemplates(config: ProjectConfig): TemplateFile[] {
  if (config.stack === 'react') {
    return [
      {
        path: 'src/__tests__/App.test.tsx',
        content: `import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });
});
`,
      },
      {
        path: 'vitest.config.ts',
        content: `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
`,
      },
    ];
  }

  return [];
}

export { getDockerTemplates, getCITemplates, getTestTemplates };
