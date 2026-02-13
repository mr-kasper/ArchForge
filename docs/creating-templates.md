# Creating Custom Templates

ArchForge uses an **EJS-based template engine** with a **registry pattern** to map `(stack, architecture)` combinations to template manifests.

> **Install:** `npm install -g @archforge/cli` or use `npx @archforge/cli init`
>
> **npm:** [@archforge/cli](https://www.npmjs.com/package/@archforge/cli) · [@archforge/core-engine](https://www.npmjs.com/package/@archforge/core-engine)
>
> **Source:** [github.com/mr-kasper/archforge](https://github.com/mr-kasper/archforge)

## Template Structure

Each template is defined as a `TemplateManifest`:

```typescript
interface TemplateManifest {
  stack: Stack; // 'react' | 'java' | 'dotnet'
  architecture: ArchitectureStyle; // 'clean' | 'layered' | 'feature-based' | 'hexagonal' | 'ddd' | ...
  files: TemplateFile[]; // Array of files to generate
  postMessages?: string[]; // Instructions shown after generation
}

interface TemplateFile {
  path: string; // Relative path (supports EJS: `src/<%= projectName %>/main.ts`)
  content: string; // EJS template content
}
```

## Available Template Variables

All templates receive these variables via the `RenderContext`:

| Variable          | Type       | Description                                                          |
| ----------------- | ---------- | -------------------------------------------------------------------- |
| `projectName`     | `string`   | User-provided project name                                           |
| `stack`           | `string`   | Selected technology stack                                            |
| `architecture`    | `string`   | Selected architecture style                                          |
| `database`        | `string`   | Database option (postgresql, mysql, mongodb, sqlite, none)           |
| `auth`            | `string`   | Auth option (jwt, oauth, session, none)                              |
| `tooling`         | `string[]` | Selected tooling options                                             |
| `packageManager`  | `string`   | Package manager (npm, yarn, pnpm, gradle, dotnet)                    |
| `apiStyle`        | `string`   | API style (rest, graphql, grpc, none)                                |
| `cssFramework`    | `string`   | CSS framework (tailwind, css-modules, styled-components, sass, none) |
| `stateManagement` | `string`   | State management (zustand, redux, jotai, context, none)              |
| `orm`             | `string`   | ORM (prisma, typeorm, hibernate, ef-core, none)                      |
| `logging`         | `string`   | Logging framework (slf4j, serilog, winston, none)                    |
| `validation`      | `string`   | Validation library (zod, bean-validation, fluent-validation, none)   |
| `port`            | `number`   | Server port (default 8080)                                           |
| `year`            | `number`   | Current year                                                         |

## Conditional Content

Use EJS conditionals to vary output based on user choices:

```ejs
<% if (database === 'postgresql') { %>
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("org.postgresql:postgresql")
<% } %>

<%# Tailwind v4 — uses @tailwindcss/vite plugin, no PostCSS needed %>
<% if (cssFramework === 'tailwind') { %>
import tailwindcss from '@tailwindcss/vite';
<% } %>

<%# State management scaffolding %>
<% if (stateManagement === 'zustand') { %>
    "zustand": "^5.0.0"
<% } %>
```

## Architecture-Specific Templates

ArchForge supports 10 architecture styles across 3 stacks (20 total templates):

| Architecture          | React | Java | .NET | Template File                        |
| --------------------- | ----- | ---- | ---- | ------------------------------------ |
| Clean                 | ✅    | ✅   | ✅   | `react.ts` / `java.ts` / `dotnet.ts` |
| Layered               | ✅    | ✅   | ✅   | `react.ts` / `java.ts` / `dotnet.ts` |
| Feature-based         | ✅    | —    | —    | `react.ts`                           |
| Feature-Sliced Design | ✅    | —    | —    | `feature-sliced.ts`                  |
| Hexagonal             | —     | ✅   | ✅   | `hexagonal.ts`                       |
| Domain-Driven Design  | —     | ✅   | ✅   | `ddd.ts`                             |
| MVC                   | —     | ✅   | ✅   | `mvc.ts`                             |
| CQRS                  | —     | ✅   | ✅   | `cqrs.ts`                            |
| Microservices         | —     | ✅   | ✅   | `microservices.ts`                   |
| Modular Monolith      | —     | ✅   | ✅   | `modular-monolith.ts`                |

## Tooling Add-ons

The generator injects additional files based on user selections. These are defined in `generator.ts`:

| Add-on            | Condition                              | Files Generated                                  |
| ----------------- | -------------------------------------- | ------------------------------------------------ |
| Docker            | `tooling.includes('docker')`           | `Dockerfile`, `.dockerignore`                    |
| CI/CD             | `tooling.includes('ci')`               | `.github/workflows/ci.yml`                       |
| Tests             | `tooling.includes('tests')`            | `vitest.config.ts`, `App.test.tsx`               |
| Tailwind CSS v4   | `cssFramework === 'tailwind'`          | `src/index.css` (with `@import "tailwindcss"`)   |
| Sass              | `cssFramework === 'sass'`              | `_variables.scss`, `_mixins.scss`, `global.scss` |
| CSS Modules       | `cssFramework === 'css-modules'`       | `App.module.css`                                 |
| Styled Components | `cssFramework === 'styled-components'` | `theme.ts`, `GlobalStyle.ts`                     |
| Zustand           | `stateManagement === 'zustand'`        | `store/useAppStore.ts`                           |
| Redux Toolkit     | `stateManagement === 'redux'`          | `store/index.ts`, `counterSlice.ts`, `hooks.ts`  |
| Jotai             | `stateManagement === 'jotai'`          | `store/atoms.ts`                                 |
| Linting           | `tooling.includes('linting')`          | `.prettierrc`, ESLint flat config                |
| Husky             | `tooling.includes('husky')`            | `.husky/pre-commit`, `.lintstagedrc.json`        |

## Creating a Plugin Template

1. Create a directory with an `archforge-plugin.json`:

```json
{
  "name": "my-custom-template",
  "version": "1.0.0",
  "description": "Custom template for my team",
  "dependencies": {},
  "devDependencies": {}
}
```

2. Add template files in a `templates/` subdirectory:

```
my-plugin/
├── archforge-plugin.json
└── templates/
    ├── src/
    │   └── custom-module/
    │       └── index.ts
    └── config/
        └── custom.json
```

3. Load the plugin:

```bash
archforge add plugin ./path/to/my-plugin
```

## Registering a New Stack

To add a new stack (e.g., Go, Python), you need to:

1. Create a template file in `packages/core-engine/src/templates/`
2. Export the manifest(s) from the file
3. Register them in `template-registry.ts`
4. Add architecture definitions in `architecture-definitions.ts`
5. Add import extractors in `rules-engine.ts` for the file extensions
6. Update the CLI prompts in `project-prompts.ts`

This modular design makes it straightforward to extend ArchForge to support any technology stack.

---

> **Contribute:** [github.com/mr-kasper/archforge](https://github.com/mr-kasper/archforge) — PRs welcome!
