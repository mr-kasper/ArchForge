<div align="center">

# 🔨 ArchForge

### Universal Architecture Generator

[![npm](https://img.shields.io/npm/v/@archforge/cli?color=cb3837&logo=npm)](https://www.npmjs.com/package/@archforge/cli)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

_A stack-agnostic CLI tool that generates standardized, production-ready architectures for multiple technologies while enforcing clean architecture, best practices, and tooling consistency._

[Getting Started](#-getting-started) · [Features](#-features) · [Architecture](#-architecture) · [Supported Stacks](#-supported-stacks) · [Roadmap](#-roadmap)

</div>

---

## 🧩 Problem

Many companies suffer from **inconsistent project architectures** across teams and technologies, leading to:

- ❌ Poor maintainability and technical debt
- ❌ Slow onboarding for new developers
- ❌ Fragmented best practices across teams
- ❌ No enforcement of architectural boundaries
- ❌ Repeated boilerplate setup for every new project

## 💡 Solution

**ArchForge** solves this by providing a **single CLI tool** that:

- ✅ Generates **standardized architectures** across **11 technology stacks** (React, Next.js, Angular, Vue, Node.js, Java, .NET, Django, Laravel, React Native, Flutter)
- ✅ **Enforces architectural rules** (not just files — actual dependency constraints)
- ✅ Pre-configures **tooling** (Docker, CI/CD, testing) out of the box
- ✅ Supports **10 architecture styles** (Clean, Layered, Hexagonal, DDD, CQRS, Microservices, etc.)
- ✅ **Context-aware interactive prompts** (CSS framework, state management, ORM, validation, etc.)
- ✅ Extensible via a **plugin system** for custom templates and rules

---

## 🏗️ Architecture

```
archforge/
├── packages/
│   ├── core-engine/          # Template rendering, rules engine, project generator
│   │   ├── src/
│   │   │   ├── types.ts              # Shared type definitions
│   │   │   ├── template-engine.ts    # EJS-based template renderer
│   │   │   ├── template-registry.ts  # Maps (stack, architecture) → templates
│   │   │   ├── rules-engine.ts       # Architecture validation rules
│   │   │   ├── plugin-loader.ts      # Plugin discovery and loading
│   │   │   ├── generator.ts          # Orchestrates project generation
│   │   │   ├── architecture-definitions.ts  # Declarative architecture configs
│   │   │   └── templates/            # Built-in template definitions (42 templates)
│   │   │       ├── react.ts          # React — Clean, Feature-based, Layered
│   │   │       ├── nextjs.ts         # Next.js — Clean, Feature-based
│   │   │       ├── angular.ts        # Angular — Clean, Layered
│   │   │       ├── vue.ts            # Vue.js — Feature-based
│   │   │       ├── nodejs.ts         # Node.js — Clean, Layered, MVC, Hexagonal, Microservices
│   │   │       ├── java.ts           # Java — Clean, Layered
│   │   │       ├── dotnet.ts         # .NET — Clean, Layered
│   │   │       ├── django.ts         # Django — MVC, Layered, Clean
│   │   │       ├── laravel.ts        # Laravel — MVC, Layered, Modular Monolith
│   │   │       ├── react-native.ts   # React Native — Clean, Feature-based
│   │   │       ├── flutter.ts        # Flutter — Clean, Feature-based
│   │   │       ├── hexagonal.ts      # Hexagonal / Ports & Adapters
│   │   │       ├── ddd.ts            # Domain-Driven Design
│   │   │       ├── feature-sliced.ts # Feature-Sliced Design (React)
│   │   │       ├── mvc.ts            # MVC
│   │   │       ├── cqrs.ts           # CQRS
│   │   │       ├── microservices.ts  # Microservices
│   │   │       └── modular-monolith.ts # Modular Monolith
│   │   └── package.json
│   │
│   └── cli/                  # Interactive CLI interface
│       ├── src/
│       │   ├── index.ts              # CLI entry point (Commander.js)
│       │   ├── commands/
│       │   │   ├── init.ts           # `archforge init`
│       │   │   ├── lint-architecture.ts  # `archforge lint-architecture`
│       │   │   └── list.ts           # `archforge list`
│       │   ├── prompts/
│       │   │   └── project-prompts.ts    # Inquirer prompts
│       │   └── ui/
│       │       ├── banner.ts         # ASCII art banner
│       │       └── spinner.ts        # Loading spinner
│       └── package.json
│
├── docs/                     # Documentation
│   ├── architecture-rules.md
│   └── creating-templates.md
│
├── examples/                 # Example generated projects
│
└── README.md
```

### How It Works

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   CLI        │────▶│  Core Engine      │────▶│  Output Project  │
│  (Inquirer)  │     │                  │     │                 │
│              │     │  ┌────────────┐  │     │  src/           │
│  archforge   │     │  │ Template   │  │     │  ├── domain/    │
│  init        │     │  │ Engine     │  │     │  ├── app/       │
│              │     │  │ (EJS)      │  │     │  ├── infra/     │
│  Prompts:    │     │  └────────────┘  │     │  ├── api/       │
│  - Stack     │     │  ┌────────────┐  │     │  Dockerfile     │
│  - Arch      │     │  │ Rules      │  │     │  .github/ci.yml │
│  - DB / ORM  │     │  │ Engine     │  │     │  package.json   │
│  - CSS / SM  │     │  └────────────┘  │     └─────────────────┘
│  - Auth      │     │  ┌────────────┐  │
│  - Tooling   │     │  │ Plugin     │  │
└─────────────┘     │  │ Plugin     │  │
                     │  │ Loader     │  │
                     │  └────────────┘  │
                     └──────────────────┘
```

---

## 🚀 Getting Started

### Installation

```bash
# Install globally from npm
npm install -g @archforge/cli

# Or run directly with npx (no install needed)
npx @archforge/cli init
```

<details>
<summary>Install from source</summary>

```bash
git clone https://github.com/mr-kasper/archforge.git
cd archforge
npm install
npm run build
npm link -w packages/cli
```

</details>

### Usage

```bash
# Interactive mode — context-aware guided prompts
archforge init

# Or run via npx without installing
npx @archforge/cli init

# Quick mode — pass flags directly
archforge init --name my-api --stack java --architecture clean --database postgresql --auth jwt

# List all 42 available templates
archforge list

# Validate architecture of an existing project
archforge lint-architecture --dir ./my-project --architecture clean
```

### Example Session

```
$ archforge init

     _             _     _____
    / \   _ __ ___| |__ |  ___|__  _ __ __ _  ___
   / _ \ | '__/ __| '_ \| |_ / _ \| '__/ _` |/ _ \
  / ___ \| | | (__| | | |  _| (_) | | | (_| |  __/
 /_/   \_\_|  \___|_| |_|_|  \___/|_|  \__, |\___|
                                        |___/

  Universal Architecture Generator — v1.1.0

  ┌─ Project Basics
  │
? Project name: my-saas-api
? Technology stack: ☕ Java (Spring Boot + Gradle)

  ┌─ Architecture
  │
? Architecture style: 🏛️  Clean Architecture

  ┌─ Data & API
  │
? Database: 🐘 PostgreSQL
? ORM / Data Access: 🟢 Hibernate / JPA
? API style: 🌐 REST

  ┌─ Security & Validation
  │
? Authentication: 🔑 JWT
? Validation library: ☕ Bean Validation

  ┌─ DevOps & Tooling
  │
? Package manager: 🐘 Gradle
? Logging framework: 📝 SLF4J + Logback
? Extra tooling: 🐳 Docker, 🔄 CI/CD, 🧪 Tests
? Server port: 8080

  ┌─ Output
  │
? Output directory: ./my-saas-api
? Generate project with these settings? Yes

📋 Project Configuration:
─────────────────────────────────────────────
  Name:            my-saas-api
  Stack:           java
  Architecture:    clean
  Database:        postgresql
  ORM:             hibernate
  API Style:       rest
  Auth:            jwt
  Validation:      bean-validation
  Pkg Manager:     gradle
  Tooling:         docker, ci, tests
  Port:            8080
  Output:          ./my-saas-api

✔ Created 18 files

╭──────────────────────────────────────────────────╮
│                                                  │
│  ✅ Project generated successfully!              │
│                                                  │
│  18 files created in ./my-saas-api               │
│                                                  │
│  → Run `gradle wrapper` then `./gradlew bootRun` │
│  → Architecture: Clean Architecture              │
│                                                  │
╰──────────────────────────────────────────────────╯
```

---

## ✨ Features

### 🔧 Multi-Stack Generation

Generate production-ready scaffolds for **11 technology stacks** across Frontend, Backend, and Mobile with a single tool.

### 🧠 Architecture Rules Engine (Key Differentiator)

ArchForge doesn't just generate files — it **encodes and enforces architectural rules**:

| Rule                          | Description                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `clean/domain-isolation`      | Domain layer cannot import from infrastructure or presentation                    |
| `clean/application-isolation` | Application layer cannot import from presentation                                 |
| `feature/isolation`           | Feature modules cannot import from other features directly                        |
| `naming/no-impl-in-domain`    | Domain files should not contain "Impl" — implementations belong in infrastructure |
| `hexagonal/port-isolation`    | Ports layer cannot import from adapters (dependency inversion)                    |
| `ddd/aggregate-isolation`     | Aggregates cannot import from other aggregates directly                           |
| `fsd/layer-order`             | Feature-Sliced layers enforce strict import hierarchy                             |
| `cqrs/segregation`            | Command handlers cannot import from queries and vice versa                        |
| `modular/module-isolation`    | Modules can only communicate through their public API                             |

Validate any existing project:

```bash
archforge lint-architecture --dir ./my-project --architecture clean
```

### 🐳 Integrated Tooling

Every generated project includes optional, pre-configured:

- **Docker** — multi-stage Dockerfiles optimized per stack
- **CI/CD** — GitHub Actions workflows with build, lint, and test steps
- **Testing** — framework-appropriate test setup (Vitest, JUnit, xUnit)

### 🔌 Plugin System

Extend ArchForge with custom templates and rules:

```bash
archforge add plugin auth-jwt
```

---

## 📦 Supported Stacks (11 stacks · 42 templates)

### Frontend

| Stack                               | Architecture Styles                                  |
| ----------------------------------- | ---------------------------------------------------- |
| **React** (TypeScript + Vite 7)     | Clean, Layered, Feature-based, Feature-Sliced Design |
| **Next.js** (App Router + SSR)      | Clean, Feature-based                                 |
| **Angular** (Standalone Components) | Clean, Layered                                       |
| **Vue.js** (Composition API + Vite) | Feature-based                                        |

### Backend

| Stack                              | Architecture Styles                                                        |
| ---------------------------------- | -------------------------------------------------------------------------- |
| **Node.js** (Express + TypeScript) | Clean, Layered, MVC, Hexagonal, Microservices                              |
| **Java** (Spring Boot + Gradle)    | Clean, Layered, Hexagonal, DDD, MVC, CQRS, Microservices, Modular Monolith |
| **.NET** (ASP.NET Core 8 + C#)     | Clean, Layered, Hexagonal, DDD, MVC, CQRS, Microservices, Modular Monolith |
| **Django** (Python + DRF)          | MVC, Layered, Clean                                                        |
| **Laravel** (PHP 8.3 + Eloquent)   | MVC, Layered, Modular Monolith                                             |

### Mobile

| Stack                                | Architecture Styles  |
| ------------------------------------ | -------------------- |
| **React Native** (Expo + TypeScript) | Clean, Feature-based |
| **Flutter** (Dart + Riverpod)        | Clean, Feature-based |

### Recommended Architectures (covers 90% of real codebases)

| Architecture             | Description                                          | Best For                              |
| ------------------------ | ---------------------------------------------------- | ------------------------------------- |
| **Clean Architecture**   | Domain → Application → Infrastructure → Presentation | Backend APIs, enterprise apps         |
| **Layered Architecture** | Controller → Service → Repository → Model            | Simple backends, quick MVPs           |
| **MVC**                  | Model-View-Controller + REST API                     | Server-rendered & traditional apps    |
| **Feature-based**        | Self-contained feature modules                       | React & Next.js scalable frontends    |
| **Modular Monolith**     | Isolated modules with public APIs & events           | Growing backends before microservices |

### Advanced Architectures (situational, not baseline)

| Architecture   | When to Use                                                  |
| -------------- | ------------------------------------------------------------ |
| Hexagonal      | Strong isolation requirements, dependency inversion at scale |
| DDD            | Complex domain logic with many business rules                |
| CQRS           | Separate read/write models, event-driven systems             |
| Microservices  | Independent deployability at organizational scale            |
| Feature-Sliced | Large React apps needing strict layer hierarchy              |

### Additional Options (Context-Aware)

| Option            | Frontend (React/Next/Angular/Vue)                 | Backend (Node/Java/.NET/Django/Laravel)  | Mobile (RN/Flutter) |
| ----------------- | ------------------------------------------------- | ---------------------------------------- | ------------------- |
| **CSS Framework** | Tailwind v4, CSS Modules, Styled Components, Sass | —                                        | —                   |
| **State Mgmt**    | Zustand 5, Redux 2, Jotai 2, Pinia, NgRx, Context | —                                        | —                   |
| **ORM**           | Prisma                                            | Hibernate, EF Core, Django ORM, Eloquent | —                   |
| **API Style**     | —                                                 | REST, GraphQL, gRPC                      | —                   |
| **Validation**    | Zod 4, class-validator                            | Bean Validation, FluentValidation        | —                   |
| **Logging**       | —                                                 | Winston, SLF4J, Serilog, Python logging  | —                   |
| **Pkg Manager**   | npm, Yarn, pnpm                                   | npm, Gradle, dotnet, pip, Composer       | npm, pub            |

### Generated Architecture Examples

**Clean Architecture (Backend)**

```
src/
├── domain/           # Entities, repository interfaces
├── application/      # Use cases, DTOs
├── infrastructure/   # Database, external services, implementations
└── presentation/     # Controllers, API endpoints
```

**Feature-based (React)**

```
src/
├── app/              # App shell, routing, providers
├── features/
│   ├── auth/         # components, hooks, services, index.ts
│   └── home/         # components, hooks, services, index.ts
├── shared/           # Reusable components, hooks, utils
└── config/           # App-wide configuration
```

---

## 🗺️ Roadmap

### Phase 1 — Foundation ✅

- [x] CLI with interactive prompts
- [x] React, Java, .NET template generation
- [x] Clean, Layered, Feature-based architecture styles
- [x] Architecture rules engine with validation (4 rules)
- [x] Docker, CI/CD, and test tooling add-ons
- [x] Plugin system foundation

### Phase 2 — Architecture Expansion ✅

- [x] 7 new architecture styles: Hexagonal, DDD, Feature-Sliced, MVC, CQRS, Microservices, Modular Monolith
- [x] 5 new architecture rules: hexagonal/port-isolation, ddd/aggregate-isolation, fsd/layer-order, cqrs/segregation, modular/module-isolation
- [x] `ArchitectureDefinition` abstraction for declarative architecture configs
- [x] 20 total templates (4 React + 8 Java + 8 .NET)

### Phase 3 — Rich Interactive Options & Latest Packages ✅

- [x] Context-aware prompts grouped by category (7 sections)
- [x] CSS framework selection: Tailwind CSS v4, CSS Modules, Styled Components, Sass
- [x] State management: Zustand 5, Redux Toolkit 2, Jotai 2, React Context
- [x] ORM: Hibernate/JPA (Java), EF Core 8 (.NET)
- [x] API style: REST, GraphQL, gRPC
- [x] Validation: Zod 4 (React), Bean Validation (Java), FluentValidation (.NET)
- [x] Logging: SLF4J (Java), Serilog (.NET)
- [x] Package manager selection, port config, confirmation step
- [x] All dependencies updated to latest: React 19, Vite 7, TypeScript 5.9, ESLint 9 (flat config)

### Phase 4 — Published on npm ✅

- [x] npm package publishing (`@archforge/core-engine`, `@archforge/cli`)
- [x] `npx @archforge/cli init` — zero-install usage
- [x] `npm install -g @archforge/cli` — global install
- [x] `prepublishOnly` auto-build, `files` field (ships only `dist/`)
- [x] `engines`, `keywords`, `repository`, `homepage` metadata

### Phase 5 — Stack Expansion ✅

- [x] 8 new stacks: Node.js, Next.js, Angular, Vue.js, Django, Laravel, React Native, Flutter
- [x] 22 new template manifests (42 total)
- [x] Stack categories: Frontend, Backend, Mobile
- [x] Per-stack options: Pinia (Vue), NgRx (Angular), Django ORM, Eloquent, Riverpod, etc.
- [x] Python (.py), PHP (.php), Dart (.dart) import extractors in rules engine
- [x] Docker, CI/CD, and test templates for all 11 stacks
- [x] Published as v1.1.0

### Phase 6 — Next

- [ ] Versioned templates (`archforge init --template react@1.2`)
- [ ] Custom template authoring guide + CLI
- [ ] Watch mode for architecture validation
- [ ] VS Code extension for inline rule violations
- [ ] Additional stacks: Go, Rust, Kotlin Multiplatform

### Phase 7 — Enterprise

- [ ] Team-shared configuration profiles
- [ ] Remote template registries
- [ ] Architecture decision records (ADR) generation
- [ ] Migration guides between architecture styles
- [ ] Metrics dashboard for architecture compliance

---

## 🏢 Why This Matters in Real Companies

This project demonstrates skills that **platform engineering**, **tech lead**, and **senior engineering** roles require:

| Skill                    | How ArchForge Demonstrates It                                         |
| ------------------------ | --------------------------------------------------------------------- |
| **Architecture Design**  | Multi-layer, clean architecture enforcement across stacks             |
| **Platform Engineering** | Developer tooling that standardizes workflows at scale                |
| **Developer Experience** | Interactive CLI, helpful error messages, pre-configured tooling       |
| **Extensibility**        | Plugin system, template registry, rule composition                    |
| **Cross-stack Thinking** | Single tool supporting 11 stacks across Frontend, Backend, and Mobile |

---

## � npm Packages

| Package                                                                          | Description                                          | Install                        |
| -------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------ |
| [`@archforge/cli`](https://www.npmjs.com/package/@archforge/cli)                 | Interactive CLI, prompts, commands                   | `npm i -g @archforge/cli`      |
| [`@archforge/core-engine`](https://www.npmjs.com/package/@archforge/core-engine) | Template rendering, rules engine, project generation | `npm i @archforge/core-engine` |

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run the CLI in development
npm run archforge -- init

# Run tests
npm test

# Clean build artifacts
npm run clean
```

---

## 📄 License

MIT © [mr-kasper](https://github.com/mr-kasper)
