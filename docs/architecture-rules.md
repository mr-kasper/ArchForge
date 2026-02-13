# Architecture Rules

ArchForge enforces architectural boundaries at the structural level. These rules are **not just lint suggestions** — they encode real dependency constraints that prevent architecture erosion over time.

> **Install:** `npm install -g @archforge/cli` or use `npx @archforge/cli init`
>
> **npm:** [@archforge/cli](https://www.npmjs.com/package/@archforge/cli) · [@archforge/core-engine](https://www.npmjs.com/package/@archforge/core-engine)
>
> **Source:** [github.com/mr-kasper/archforge](https://github.com/mr-kasper/archforge)

## Built-in Rules (9 total)

### `clean/domain-isolation`

**Applies to:** `**/domain/**/*.{ts,java,cs}`

The domain layer is the core of your application. It must remain pure and free from infrastructure or presentation concerns.

**Forbidden imports from domain layer:**

- `infrastructure/*` — Database drivers, HTTP clients, etc.
- `presentation/*` — Controllers, views, UI components

**Example violation:**

```typescript
// src/domain/entities/User.ts
import { PrismaClient } from '../../infrastructure/database'; // ❌ VIOLATION
```

**How to fix:** Define an interface in the domain layer and implement it in infrastructure.

---

### `clean/application-isolation`

**Applies to:** `**/application/**/*.{ts,java,cs}`

The application layer orchestrates use cases. It should only depend on the domain layer, never on presentation.

**Forbidden imports:**

- `presentation/*`

---

### `feature/isolation`

**Applies to:** `**/features/**/*.{ts,tsx,java,cs}`

In feature-based architecture, each feature module must be self-contained. Features should communicate only through shared modules, never import directly from other features.

**Example violation:**

```typescript
// src/features/auth/hooks/useAuth.ts
import { UserCard } from '../../profile/components/UserCard'; // ❌ VIOLATION
```

**How to fix:** Move shared components to `src/shared/components/`.

---

### `naming/no-impl-in-domain`

**Applies to:** `**/domain/**/*.{ts,java,cs}`

Domain layer files should not contain "Impl" in their names. Implementation classes belong in the infrastructure layer.

**Example violation:**

```
src/domain/repositories/UserRepositoryImpl.ts  // ❌ VIOLATION
```

**How to fix:** Move to `src/infrastructure/repositories/UserRepositoryImpl.ts`.

---

### `hexagonal/port-isolation`

**Applies to:** `**/ports/**/*.{ts,java,cs}`

In Hexagonal (Ports & Adapters) architecture, the ports layer defines interfaces that adapters implement. Ports must never import from adapters — this enforces the Dependency Inversion Principle.

**Forbidden imports:**

- `adapters/*`

**Example violation:**

```java
// src/ports/in/CreateOrderUseCase.java
import com.myapp.adapters.persistence.OrderJpaRepository; // ❌ VIOLATION
```

**How to fix:** Define a repository interface in ports, implement it in adapters.

---

### `ddd/aggregate-isolation`

**Applies to:** `**/domain/model/aggregate/**/*.{ts,java,cs}`

In Domain-Driven Design, aggregates are consistency boundaries. Each aggregate should be self-contained and never import directly from another aggregate. Cross-aggregate communication happens via domain events or application services.

**Forbidden imports:**

- Other `aggregate/*` paths (different aggregate names)

**Example violation:**

```java
// src/domain/model/aggregate/OrderAggregate.java
import com.myapp.domain.model.aggregate.UserAggregate; // ❌ VIOLATION
```

**How to fix:** Use domain events or pass data through application services.

---

### `fsd/layer-order`

**Applies to:** `**/entities/**/*.{ts,tsx}`

Feature-Sliced Design enforces a strict layer hierarchy: `app → processes → pages → widgets → features → entities → shared`. Lower layers cannot import from higher layers.

**Forbidden imports from `entities` layer:**

- `features/*`, `widgets/*`, `pages/*`, `processes/*`, `app/*`

**Example violation:**

```typescript
// src/entities/user/model.ts
import { useAuth } from '../../features/auth/hooks'; // ❌ VIOLATION
```

**How to fix:** Move shared logic to `shared/` or restructure the dependency direction.

---

### `cqrs/segregation`

**Applies to:** `**/commands/**/*.{ts,java,cs}` and `**/queries/**/*.{ts,java,cs}`

CQRS (Command/Query Responsibility Segregation) requires that command handlers and query handlers remain completely separate. Commands must not import from queries and vice versa.

**Forbidden imports:**

- Commands cannot import from `queries/*`
- Queries cannot import from `commands/*`

**Example violation:**

```java
// src/commands/CreateOrderHandler.java
import com.myapp.queries.GetOrderQuery; // ❌ VIOLATION
```

---

### `modular/module-isolation`

**Applies to:** `**/modules/*/internal/**/*.{ts,java,cs}`

In a Modular Monolith, each module's internal implementation is private. Modules can only communicate through their public API (typically an `api/` or `public/` directory). The `internal/` directory is off-limits to other modules.

**Forbidden imports:**

- Other modules' `internal/*` paths

**Example violation:**

```java
// src/modules/orders/internal/OrderService.java
import com.myapp.modules.users.internal.UserRepository; // ❌ VIOLATION
```

**How to fix:** Import from the other module's public API: `modules/users/api/UserApi`.

---

## Using the Linter

```bash
# Validate against clean architecture rules
archforge lint-architecture --dir ./my-project --architecture clean

# Validate against hexagonal architecture
archforge lint-architecture --dir ./my-project --architecture hexagonal

# Validate against feature-sliced design
archforge lint-architecture --dir ./my-project --architecture feature-sliced

# Validate CQRS segregation
archforge lint-architecture --dir ./my-project --architecture cqrs
```

## Rules per Architecture

| Architecture     | Rules Applied                                                                       |
| ---------------- | ----------------------------------------------------------------------------------- |
| Clean            | `clean/domain-isolation`, `clean/application-isolation`, `naming/no-impl-in-domain` |
| Layered          | `clean/application-isolation`                                                       |
| Feature-based    | `feature/isolation`                                                                 |
| Feature-Sliced   | `fsd/layer-order`, `feature/isolation`                                              |
| Hexagonal        | `hexagonal/port-isolation`, `clean/domain-isolation`                                |
| DDD              | `ddd/aggregate-isolation`, `clean/domain-isolation`, `naming/no-impl-in-domain`     |
| MVC              | `clean/application-isolation`                                                       |
| CQRS             | `cqrs/segregation`, `clean/domain-isolation`                                        |
| Microservices    | `clean/domain-isolation`, `clean/application-isolation`                             |
| Modular Monolith | `modular/module-isolation`, `clean/domain-isolation`                                |

## Adding Custom Rules

Custom rules can be added through the plugin system. Each rule implements the `ArchitectureRule` interface:

```typescript
interface ArchitectureRule {
  id: string;
  description: string;
  appliesTo: string; // glob pattern
  validate: (filePath: string, imports: string[]) => RuleViolation[];
}
```

See [Creating Templates](./creating-templates.md) for plugin development details.

---

> **Contribute:** [github.com/mr-kasper/archforge](https://github.com/mr-kasper/archforge) — PRs welcome!
