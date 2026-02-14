<div align="center">

# 🔨 ArchForge

### Universal Architecture Generator

[![npm](https://img.shields.io/npm/v/@archforge/cli?color=cb3837&logo=npm)](https://www.npmjs.com/package/@archforge/cli)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/mr-kasper/archforge/blob/main/LICENSE)

_A stack-agnostic CLI tool that generates standardized, production-ready architectures for multiple technologies while enforcing clean architecture, best practices, and tooling consistency._

</div>

---

## 🚀 Quick Start

```bash
# Run directly with npx (no install needed)
npx @archforge/cli init

# Or install globally
npm install -g @archforge/cli
archforge init
```

## ✨ Features

- **11 Stacks** — React, Next.js, Angular, Vue.js, Node.js, Java, .NET, Django, Laravel, React Native, Flutter
- **10 Architecture Styles** — Clean, Layered, Feature-based, Feature-Sliced, Hexagonal, DDD, MVC, CQRS, Microservices, Modular Monolith
- **42 Templates** — Every supported stack × architecture combination
- **9 Architecture Rules** — Enforces dependency constraints, not just file layout
- **Context-Aware Prompts** — CSS framework, state management, ORM, validation, logging, and more
- **Tooling Add-ons** — Docker, CI/CD, testing, linting, Husky pre-configured out of the box
- **Plugin System** — Extend with custom templates and rules
- **Latest Packages** — React 19, Vite 7, TypeScript 5.9, Tailwind CSS v4, Zustand 5, Zod 4, ESLint 9

## 📦 Commands

```bash
# Interactive mode — guided prompts across 7 sections
archforge init

# Quick mode — pass flags directly
archforge init --name my-api --stack java --architecture clean --database postgresql --auth jwt

# List all available templates
archforge list

# Validate architecture of an existing project
archforge lint-architecture --dir ./my-project --architecture clean
```

## 🧠 Example Session

```
$ archforge init

  ┌─ Project Basics
? Project name: my-saas-api
? Technology stack: ☕ Java (Spring Boot + Gradle)

  ┌─ Architecture
? Architecture style: 🏛️  Clean Architecture

  ┌─ Data & API
? Database: 🐘 PostgreSQL
? ORM / Data Access: 🟢 Hibernate / JPA
? API style: 🌐 REST

  ┌─ Security & Validation
? Authentication: 🔑 JWT
? Validation library: ☕ Bean Validation

  ┌─ DevOps & Tooling
? Package manager: 🐘 Gradle
? Logging framework: 📝 SLF4J + Logback
? Extra tooling: 🐳 Docker, 🔄 CI/CD, 🧪 Tests
? Server port: 8080

✔ Created 18 files in ./my-saas-api
```

## 📋 Supported Stacks (11 stacks · 42 templates)

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

### ✅ Recommended Architectures (covers 90% of real codebases)

| Architecture             | Best For                              |
| ------------------------ | ------------------------------------- |
| **Clean Architecture**   | Backend APIs, enterprise apps         |
| **Layered Architecture** | Simple backends, quick MVPs           |
| **MVC**                  | Server-rendered & traditional apps    |
| **Feature-based**        | React & Next.js scalable frontends    |
| **Modular Monolith**     | Growing backends before microservices |

### ⚠️ Advanced Architectures (situational, not baseline)

Hexagonal · DDD · CQRS · Microservices · Feature-Sliced Design

### Context-Aware Options

| Option            | Frontend (React/Next/Angular/Vue)                 | Backend (Node/Java/.NET/Django/Laravel)  | Mobile (RN/Flutter) |
| ----------------- | ------------------------------------------------- | ---------------------------------------- | ------------------- |
| **CSS Framework** | Tailwind v4, CSS Modules, Styled Components, Sass | —                                        | —                   |
| **State Mgmt**    | Zustand 5, Redux 2, Jotai 2, Pinia, NgRx, Context | —                                        | —                   |
| **ORM**           | Prisma                                            | Hibernate, EF Core, Django ORM, Eloquent | —                   |
| **API Style**     | —                                                 | REST, GraphQL, gRPC                      | —                   |
| **Validation**    | Zod 4, class-validator                            | Bean Validation, FluentValidation        | —                   |
| **Logging**       | —                                                 | Winston, SLF4J, Serilog, Python logging  | —                   |

## 🧪 Architecture Rules Engine

ArchForge doesn't just generate files — it **enforces architectural rules**:

| Rule                          | Description                                              |
| ----------------------------- | -------------------------------------------------------- |
| `clean/domain-isolation`      | Domain cannot import from infrastructure or presentation |
| `clean/application-isolation` | Application cannot import from presentation              |
| `feature/isolation`           | Features cannot import from other features directly      |
| `naming/no-impl-in-domain`    | No "Impl" files in domain layer                          |
| `hexagonal/port-isolation`    | Ports cannot import from adapters                        |
| `ddd/aggregate-isolation`     | Aggregates cannot import from other aggregates           |
| `fsd/layer-order`             | Feature-Sliced layers enforce strict import hierarchy    |
| `cqrs/segregation`            | Commands and queries remain completely separate          |
| `modular/module-isolation`    | Modules communicate only through public API              |

```bash
archforge lint-architecture --dir ./my-project --architecture clean
```

## 📦 Packages

| Package                                                                          | Description                                          |
| -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [`@archforge/cli`](https://www.npmjs.com/package/@archforge/cli)                 | Interactive CLI, prompts, commands                   |
| [`@archforge/core-engine`](https://www.npmjs.com/package/@archforge/core-engine) | Template rendering, rules engine, project generation |

## 🔗 Links

- **GitHub:** [github.com/mr-kasper/archforge](https://github.com/mr-kasper/archforge)
- **npm:** [@archforge/cli](https://www.npmjs.com/package/@archforge/cli)
- **Docs:** [Architecture Rules](https://github.com/mr-kasper/archforge/blob/main/docs/architecture-rules.md) · [Creating Templates](https://github.com/mr-kasper/archforge/blob/main/docs/creating-templates.md)

## 📄 License

MIT © [mr-kasper](https://github.com/mr-kasper)
