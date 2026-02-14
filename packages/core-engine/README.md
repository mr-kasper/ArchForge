<div align="center">

# 🔨 @archforge/core-engine

### Template Rendering, Rules Engine & Project Generation

[![npm](https://img.shields.io/npm/v/@archforge/core-engine?color=cb3837&logo=npm)](https://www.npmjs.com/package/@archforge/core-engine)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)

_The core engine behind [ArchForge](https://github.com/mr-kasper/archforge) — handles template rendering, architecture rules validation, and project generation._

</div>

---

## 📦 Installation

```bash
npm install @archforge/core-engine
```

> **Looking for the CLI?** Use [`@archforge/cli`](https://www.npmjs.com/package/@archforge/cli) instead:
>
> ```bash
> npx @archforge/cli init
> ```

## 🧩 What's Included

### Template Engine

EJS-based template renderer that interpolates project configuration into file content and paths.

```typescript
import { TemplateEngine } from '@archforge/core-engine';

const engine = new TemplateEngine();
const context = engine.buildContext(projectConfig);
const rendered = engine.render(templateContent, context);
```

### Template Registry

Maps `(stack, architecture)` combinations to template manifests — 20 built-in templates across 3 stacks and 10 architecture styles.

```typescript
import { TemplateRegistry } from '@archforge/core-engine';

const registry = new TemplateRegistry();
const templates = registry.getAll(); // All 20 templates
const template = registry.get('react', 'clean'); // Specific template
```

### Rules Engine

Validates projects against 9 architecture rules that enforce real dependency constraints.

```typescript
import { RulesEngine } from '@archforge/core-engine';

const engine = new RulesEngine();
const violations = await engine.validate('./my-project', 'clean');
// Returns: RuleViolation[] with file, rule, and description
```

### Project Generator

Orchestrates end-to-end project generation: template rendering, file writing, and tooling add-ons.

```typescript
import { ProjectGenerator } from '@archforge/core-engine';

const generator = new ProjectGenerator();
await generator.generate({
  name: 'my-api',
  stack: 'java',
  architecture: 'clean',
  database: 'postgresql',
  auth: 'jwt',
  tooling: ['docker', 'ci', 'tests'],
  // ... more options
});
```

## 📋 Supported Stacks & Architectures

| Stack     | Architectures                                                              |
| --------- | -------------------------------------------------------------------------- |
| **React** | Clean, Layered, Feature-based, Feature-Sliced Design                       |
| **Java**  | Clean, Layered, Hexagonal, DDD, MVC, CQRS, Microservices, Modular Monolith |
| **.NET**  | Clean, Layered, Hexagonal, DDD, MVC, CQRS, Microservices, Modular Monolith |

**Recommended (baseline):** Clean · Layered · MVC · Feature-based · Modular Monolith

**Advanced (situational):** Hexagonal · DDD · CQRS · Microservices · Feature-Sliced

## 🧪 Architecture Rules (9 total)

| Rule                          | Description                                              |
| ----------------------------- | -------------------------------------------------------- |
| `clean/domain-isolation`      | Domain cannot import from infrastructure or presentation |
| `clean/application-isolation` | Application cannot import from presentation              |
| `feature/isolation`           | Features cannot cross-import                             |
| `naming/no-impl-in-domain`    | No "Impl" files in domain                                |
| `hexagonal/port-isolation`    | Ports cannot import from adapters                        |
| `ddd/aggregate-isolation`     | Aggregates cannot cross-import                           |
| `fsd/layer-order`             | FSD layers enforce import hierarchy                      |
| `cqrs/segregation`            | Commands and queries stay separate                       |
| `modular/module-isolation`    | Modules use public API only                              |

## 🔗 Links

- **GitHub:** [github.com/mr-kasper/archforge](https://github.com/mr-kasper/archforge)
- **CLI package:** [@archforge/cli](https://www.npmjs.com/package/@archforge/cli)
- **Docs:** [Architecture Rules](https://github.com/mr-kasper/archforge/blob/main/docs/architecture-rules.md) · [Creating Templates](https://github.com/mr-kasper/archforge/blob/main/docs/creating-templates.md)

## 📄 License

MIT © [mr-kasper](https://github.com/mr-kasper)
