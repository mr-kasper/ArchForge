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

    // Add CSS framework scaffolding (React only)
    if (config.stack === 'react' && config.cssFramework && config.cssFramework !== 'none') {
      templates.push(...getCSSFrameworkTemplates(config));
    }

    // Add state management setup (React only)
    if (config.stack === 'react' && config.stateManagement && config.stateManagement !== 'none') {
      templates.push(...getStateManagementTemplates(config));
    }

    // Add linting setup (React only)
    if (config.tooling.includes('linting')) {
      templates.push(...getLintingTemplates(config));
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

// ── CSS Framework add-ons ────────────────────────────

function getCSSFrameworkTemplates(config: ProjectConfig): TemplateFile[] {
  const templates: TemplateFile[] = [];

  if (config.cssFramework === 'tailwind') {
    templates.push({
      path: 'src/index.css',
      content: `@import "tailwindcss";

/* ── Custom styles below ── */
`,
    });
  } else if (config.cssFramework === 'sass') {
    templates.push(
      {
        path: 'src/styles/_variables.scss',
        content: `// ── Design tokens ──
$primary: #3b82f6;
$secondary: #64748b;
$background: #ffffff;
$text: #1e293b;
$border-radius: 0.5rem;
$spacing-unit: 0.25rem;
`,
      },
      {
        path: 'src/styles/_mixins.scss',
        content: `@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin responsive($breakpoint) {
  @if $breakpoint == sm { @media (min-width: 640px) { @content; } }
  @if $breakpoint == md { @media (min-width: 768px) { @content; } }
  @if $breakpoint == lg { @media (min-width: 1024px) { @content; } }
}
`,
      },
      {
        path: 'src/styles/global.scss',
        content: `@use 'variables' as *;

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: $background;
  color: $text;
}
`,
      },
    );
  } else if (config.cssFramework === 'css-modules') {
    templates.push({
      path: 'src/styles/App.module.css',
      content: `.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.heading {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}
`,
    });
  } else if (config.cssFramework === 'styled-components') {
    templates.push(
      {
        path: 'src/styles/theme.ts',
        content: `export const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    text: '#1e293b',
    border: '#e2e8f0',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: '0.5rem',
} as const;

export type Theme = typeof theme;
`,
      },
      {
        path: 'src/styles/GlobalStyle.ts',
        content: `import { createGlobalStyle } from 'styled-components';
import type { Theme } from './theme';

export const GlobalStyle = createGlobalStyle<{ theme: Theme }>'\`\n  *,\n  *::before,\n  *::after {\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n  }\n\n  body {\n    font-family: system-ui, -apple-system, sans-serif;\n    background: \${({ theme }) => theme.colors.background};\n    color: \${({ theme }) => theme.colors.text};\n  }\n\`';
`,
      },
    );
  }

  return templates;
}

// ── State Management add-ons ─────────────────────────

function getStateManagementTemplates(config: ProjectConfig): TemplateFile[] {
  const templates: TemplateFile[] = [];

  if (config.stateManagement === 'zustand') {
    templates.push({
      path: 'src/store/useAppStore.ts',
      content: `import { create } from 'zustand';

interface AppState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  decrement: () => set((s) => ({ count: s.count - 1 })),
  reset: () => set({ count: 0 }),
}));
`,
    });
  } else if (config.stateManagement === 'redux') {
    templates.push(
      {
        path: 'src/store/index.ts',
        content: `import { configureStore } from '@reduxjs/toolkit';
import { counterSlice } from './counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
`,
      },
      {
        path: 'src/store/counterSlice.ts',
        content: `import { createSlice } from '@reduxjs/toolkit';

interface CounterState {
  value: number;
}

const initialState: CounterState = { value: 0 };

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
    reset: (state) => { state.value = 0; },
  },
});

export const { increment, decrement, reset } = counterSlice.actions;
`,
      },
      {
        path: 'src/store/hooks.ts',
        content: `import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
`,
      },
    );
  } else if (config.stateManagement === 'jotai') {
    templates.push({
      path: 'src/store/atoms.ts',
      content: `import { atom } from 'jotai';

export const countAtom = atom(0);
export const doubleCountAtom = atom((get) => get(countAtom) * 2);
`,
    });
  }

  return templates;
}

// ── Linting add-ons ──────────────────────────────────

function getLintingTemplates(config: ProjectConfig): TemplateFile[] {
  const templates: TemplateFile[] = [];

  templates.push({
    path: '.prettierrc',
    content: `{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
`,
  });

  if (config.tooling.includes('husky')) {
    templates.push(
      {
        path: '.husky/pre-commit',
        content: `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`,
      },
      {
        path: '.lintstagedrc.json',
        content: `{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css,scss}": ["prettier --write"]
}
`,
      },
    );
  }

  return templates;
}

export {
  getDockerTemplates,
  getCITemplates,
  getTestTemplates,
  getCSSFrameworkTemplates,
  getStateManagementTemplates,
  getLintingTemplates,
};
