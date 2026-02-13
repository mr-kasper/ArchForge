# Architecture Rules

ArchForge enforces architectural boundaries at the structural level. These rules are **not just lint suggestions** — they encode real dependency constraints that prevent architecture erosion over time.

## Built-in Rules

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

## Using the Linter

```bash
# Validate against clean architecture rules
archforge lint-architecture --dir ./my-project --architecture clean

# Validate against feature-based rules
archforge lint-architecture --dir ./my-project --architecture feature-based
```

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
