# Creating Custom Templates

ArchForge uses an **EJS-based template engine** with a **registry pattern** to map `(stack, architecture)` combinations to template manifests.

## Template Structure

Each template is defined as a `TemplateManifest`:

```typescript
interface TemplateManifest {
  stack: Stack; // 'react' | 'java' | 'dotnet'
  architecture: ArchitectureStyle; // 'clean' | 'layered' | 'feature-based'
  files: TemplateFile[]; // Array of files to generate
  postMessages?: string[]; // Instructions shown after generation
}

interface TemplateFile {
  path: string; // Relative path (supports EJS: `src/<%= projectName %>/main.ts`)
  content: string; // EJS template content
}
```

## Available Template Variables

All templates receive these variables:

| Variable       | Type       | Description                 |
| -------------- | ---------- | --------------------------- |
| `projectName`  | `string`   | User-provided project name  |
| `stack`        | `string`   | Selected technology stack   |
| `architecture` | `string`   | Selected architecture style |
| `database`     | `string`   | Selected database option    |
| `auth`         | `string`   | Selected auth option        |
| `tooling`      | `string[]` | Selected tooling options    |
| `year`         | `number`   | Current year                |

## Conditional Content

Use EJS conditionals to vary output based on user choices:

```ejs
<% if (database === 'postgresql') { %>
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    runtimeOnly("org.postgresql:postgresql")
<% } %>
```

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
4. Add import extractors in `rules-engine.ts` for the file extensions
5. Update the CLI prompts in `project-prompts.ts`

This modular design makes it straightforward to extend ArchForge to support any technology stack.
