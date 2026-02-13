<div align="center">

# 🔨 ArchForge

### Universal Architecture Generator

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
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

- ✅ Generates **standardized architectures** across React, Java, and .NET
- ✅ **Enforces architectural rules** (not just files — actual dependency constraints)
- ✅ Pre-configures **tooling** (Docker, CI/CD, testing) out of the box
- ✅ Supports multiple **architecture styles** (Clean, Layered, Feature-based)
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
│   │   │   └── templates/            # Built-in template definitions
│   │   │       ├── react.ts
│   │   │       ├── java.ts
│   │   │       └── dotnet.ts
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
│  - DB        │     │  │ Engine     │  │     │  package.json   │
│  - Auth      │     │  └────────────┘  │     └─────────────────┘
│  - Tooling   │     │  ┌────────────┐  │
└─────────────┘     │  │ Plugin     │  │
                     │  │ Loader     │  │
                     │  └────────────┘  │
                     └──────────────────┘
```

---

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/archforge.git
cd archforge

# Install dependencies
npm install

# Build all packages
npm run build

# Link the CLI globally (optional)
npm link -w packages/cli
```

### Usage

```bash
# Interactive mode — guided prompts
archforge init

# Quick mode — pass flags directly
archforge init --name my-api --stack java --architecture clean --database postgresql --auth jwt

# List available templates
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

  Universal Architecture Generator — v1.0.0

? Project name: my-saas-api
? Technology stack: ☕ Java (Spring Boot + Gradle)
? Architecture style: 🏛️  Clean Architecture
? Database: 🐘 PostgreSQL
? Authentication: 🔑 JWT
? Tooling: 🐳 Docker, 🔄 CI/CD, 🧪 Tests

📋 Project Configuration:
────────────────────────────────
  Name:          my-saas-api
  Stack:         java
  Architecture:  clean
  Database:      postgresql
  Auth:          jwt
  Tooling:       docker, ci, tests

✔ Created 18 files

╭──────────────────────────────────────────────────╮
│                                                  │
│  ✅ Project generated successfully!              │
│                                                  │
│  18 files created in ./my-saas-api               │
│                                                  │
│  → Run `gradle wrapper` to generate the wrapper  │
│  → Run `./gradlew bootRun` to start              │
│  → Architecture: Clean Architecture              │
│                                                  │
╰──────────────────────────────────────────────────╯
```

---

## ✨ Features

### 🔧 Multi-Stack Generation

Generate production-ready scaffolds for three major technology stacks with a single tool.

### 🧠 Architecture Rules Engine (Key Differentiator)

ArchForge doesn't just generate files — it **encodes and enforces architectural rules**:

| Rule                          | Description                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `clean/domain-isolation`      | Domain layer cannot import from infrastructure or presentation                    |
| `clean/application-isolation` | Application layer cannot import from presentation                                 |
| `feature/isolation`           | Feature modules cannot import from other features directly                        |
| `naming/no-impl-in-domain`    | Domain files should not contain "Impl" — implementations belong in infrastructure |

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

## 📦 Supported Stacks

| Stack                           | Architecture Styles           | Database          | Auth       |
| ------------------------------- | ----------------------------- | ----------------- | ---------- |
| **React** (TypeScript + Vite)   | Clean, Layered, Feature-based | PostgreSQL, MySQL | JWT, OAuth |
| **Java** (Spring Boot + Gradle) | Clean, Layered                | PostgreSQL, MySQL | JWT, OAuth |
| **.NET** (ASP.NET Core 8 + C#)  | Clean, Layered                | PostgreSQL, MySQL | JWT, OAuth |

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

### Phase 1 — MVP ✅

- [x] CLI with interactive prompts
- [x] React, Java, .NET template generation
- [x] Clean, Layered, Feature-based architecture styles
- [x] Architecture rules engine with validation
- [x] Docker, CI/CD, and test tooling add-ons
- [x] Plugin system foundation

### Phase 2 — Enhanced

- [ ] Versioned templates (`archforge init --template react@1.2`)
- [ ] Custom template authoring guide + CLI
- [ ] Watch mode for architecture validation
- [ ] VS Code extension for inline rule violations
- [ ] Additional stacks: Go, Python (FastAPI), Rust

### Phase 3 — Enterprise

- [ ] Team-shared configuration profiles
- [ ] Remote template registries
- [ ] Architecture decision records (ADR) generation
- [ ] Migration guides between architecture styles
- [ ] Metrics dashboard for architecture compliance

---

## 🏢 Why This Matters in Real Companies

This project demonstrates skills that **platform engineering**, **tech lead**, and **senior engineering** roles require:

| Skill                    | How ArchForge Demonstrates It                                   |
| ------------------------ | --------------------------------------------------------------- |
| **Architecture Design**  | Multi-layer, clean architecture enforcement across stacks       |
| **Platform Engineering** | Developer tooling that standardizes workflows at scale          |
| **Developer Experience** | Interactive CLI, helpful error messages, pre-configured tooling |
| **Extensibility**        | Plugin system, template registry, rule composition              |
| **Cross-stack Thinking** | Single tool supporting React, Java, and .NET                    |

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

### Project Structure

| Package                  | Purpose                                              |
| ------------------------ | ---------------------------------------------------- |
| `@archforge/core-engine` | Template rendering, rules engine, project generation |
| `@archforge/cli`         | Interactive CLI, prompts, commands                   |

---

## 📄 License

MIT © ArchForge Contributors
