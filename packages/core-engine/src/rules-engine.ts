// ─────────────────────────────────────────────────────────
// Architecture Rules Engine
// Encodes structural rules, not just files.
// ─────────────────────────────────────────────────────────

import { ArchitectureRule, RuleViolation, Stack, ArchitectureStyle } from './types';
import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';

// ── Built-in rules ──────────────────────────────────────

const CLEAN_ARCH_LAYERS = ['domain', 'application', 'infrastructure', 'presentation'] as const;

/**
 * Domain layer must NOT import from infrastructure or presentation.
 */
const domainIsolationRule: ArchitectureRule = {
  id: 'clean/domain-isolation',
  description: 'Domain layer cannot import from infrastructure or presentation layers',
  appliesTo: '**/domain/**/*.{ts,java,cs}',
  validate(filePath: string, imports: string[]): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const forbidden = ['infrastructure', 'presentation'];
    for (const imp of imports) {
      for (const layer of forbidden) {
        if (imp.includes(layer)) {
          violations.push({
            ruleId: 'clean/domain-isolation',
            file: filePath,
            message: `Domain layer file imports from forbidden layer "${layer}": ${imp}`,
            severity: 'error',
          });
        }
      }
    }
    return violations;
  },
};

/**
 * Application layer must NOT import from presentation layer.
 */
const applicationIsolationRule: ArchitectureRule = {
  id: 'clean/application-isolation',
  description: 'Application layer cannot import from presentation layer',
  appliesTo: '**/application/**/*.{ts,java,cs}',
  validate(filePath: string, imports: string[]): RuleViolation[] {
    const violations: RuleViolation[] = [];
    for (const imp of imports) {
      if (imp.includes('presentation')) {
        violations.push({
          ruleId: 'clean/application-isolation',
          file: filePath,
          message: `Application layer file imports from forbidden layer "presentation": ${imp}`,
          severity: 'error',
        });
      }
    }
    return violations;
  },
};

/**
 * Feature modules should be self-contained — no cross-feature imports.
 */
const featureIsolationRule: ArchitectureRule = {
  id: 'feature/isolation',
  description: 'Feature modules cannot import from other feature modules directly',
  appliesTo: '**/features/**/*.{ts,tsx,java,cs}',
  validate(filePath: string, imports: string[]): RuleViolation[] {
    const violations: RuleViolation[] = [];
    // Determine which feature this file belongs to
    const match = filePath.replace(/\\/g, '/').match(/features\/([^/]+)\//);
    if (!match) return violations;
    const currentFeature = match[1];

    for (const imp of imports) {
      const impNorm = imp.replace(/\\/g, '/');
      const featureImportMatch = impNorm.match(/features\/([^/]+)/);
      if (featureImportMatch && featureImportMatch[1] !== currentFeature) {
        violations.push({
          ruleId: 'feature/isolation',
          file: filePath,
          message: `Feature "${currentFeature}" imports from feature "${featureImportMatch[1]}". Use shared modules instead.`,
          severity: 'error',
        });
      }
    }
    return violations;
  },
};

/**
 * Naming convention: files inside domain/ should use PascalCase or camelCase, never kebab-case with "impl".
 */
const namingConventionRule: ArchitectureRule = {
  id: 'naming/no-impl-in-domain',
  description:
    'Domain layer files should not contain "Impl" — implementations belong in infrastructure',
  appliesTo: '**/domain/**/*.{ts,java,cs}',
  validate(filePath: string): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const fileName = path.basename(filePath);
    if (/impl/i.test(fileName)) {
      violations.push({
        ruleId: 'naming/no-impl-in-domain',
        file: filePath,
        message: `File "${fileName}" contains "Impl". Implementations should live in the infrastructure layer.`,
        severity: 'warning',
      });
    }
    return violations;
  },
};

// ── Hexagonal Architecture rules ────────────────────────

/**
 * Ports (domain interfaces) must not import from adapters.
 */
const hexagonalPortIsolationRule: ArchitectureRule = {
  id: 'hexagonal/port-isolation',
  description: 'Ports (domain) cannot import from adapters (infrastructure)',
  appliesTo: '**/ports/**/*.{ts,java,cs}',
  validate(filePath: string, imports: string[]): RuleViolation[] {
    const violations: RuleViolation[] = [];
    for (const imp of imports) {
      if (imp.includes('adapter') || imp.includes('infrastructure')) {
        violations.push({
          ruleId: 'hexagonal/port-isolation',
          file: filePath,
          message: `Port imports from adapter/infrastructure: ${imp}`,
          severity: 'error',
        });
      }
    }
    return violations;
  },
};

// ── DDD rules ───────────────────────────────────────────

/**
 * Aggregates should not import from infrastructure or presentation layers.
 */
const dddAggregateIsolationRule: ArchitectureRule = {
  id: 'ddd/aggregate-isolation',
  description: 'Domain aggregates must not depend on infrastructure or presentation',
  appliesTo: '**/domain/**/*.{ts,java,cs}',
  validate(filePath: string, imports: string[]): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const forbidden = ['infrastructure', 'persistence', 'presentation', 'controller', 'api'];
    for (const imp of imports) {
      for (const layer of forbidden) {
        if (imp.toLowerCase().includes(layer)) {
          violations.push({
            ruleId: 'ddd/aggregate-isolation',
            file: filePath,
            message: `Domain imports from forbidden layer "${layer}": ${imp}`,
            severity: 'error',
          });
        }
      }
    }
    return violations;
  },
};

// ── FSD rules ───────────────────────────────────────────

/**
 * Feature-Sliced Design: lower layers cannot import from upper layers.
 * Layer order: shared < entities < features < widgets < pages < processes < app
 */
const fsdLayerOrderRule: ArchitectureRule = {
  id: 'fsd/layer-order',
  description: 'Lower FSD layers cannot import from upper layers',
  appliesTo: 'src/**/*.{ts,tsx}',
  validate(filePath: string, imports: string[]): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const layers = ['shared', 'entities', 'features', 'widgets', 'pages', 'processes', 'app'];
    const normPath = filePath.replace(/\\/g, '/');
    const currentLayer = layers.find((l) => normPath.includes(`/${l}/`));
    if (!currentLayer) return violations;
    const currentIdx = layers.indexOf(currentLayer);

    for (const imp of imports) {
      const impNorm = imp.replace(/\\/g, '/');
      for (let i = currentIdx + 1; i < layers.length; i++) {
        if (impNorm.includes(`@${layers[i]}`) || impNorm.includes(`/${layers[i]}/`)) {
          violations.push({
            ruleId: 'fsd/layer-order',
            file: filePath,
            message: `Layer "${currentLayer}" imports from upper layer "${layers[i]}": ${imp}`,
            severity: 'error',
          });
        }
      }
    }
    return violations;
  },
};

// ── CQRS rules ──────────────────────────────────────────

/**
 * Command handlers must not import from query/readmodel; query handlers must not import from writemodel.
 */
const cqrsSegregationRule: ArchitectureRule = {
  id: 'cqrs/segregation',
  description: 'Command side must not import from query/read side and vice-versa',
  appliesTo: '**/{command,query}/**/*.{ts,java,cs}',
  validate(filePath: string, imports: string[]): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const normPath = filePath.replace(/\\/g, '/').toLowerCase();
    const isCommand = normPath.includes('/command');
    const isQuery = normPath.includes('/query');

    for (const imp of imports) {
      const impLower = imp.toLowerCase();
      if (isCommand && (impLower.includes('readmodel') || impLower.includes('query'))) {
        violations.push({
          ruleId: 'cqrs/segregation',
          file: filePath,
          message: `Command side imports from query/read side: ${imp}`,
          severity: 'error',
        });
      }
      if (isQuery && (impLower.includes('writemodel') || impLower.includes('command'))) {
        violations.push({
          ruleId: 'cqrs/segregation',
          file: filePath,
          message: `Query side imports from command/write side: ${imp}`,
          severity: 'error',
        });
      }
    }
    return violations;
  },
};

// ── Modular Monolith rules ──────────────────────────────

/**
 * Modules must only interact via their public API interfaces, not internal classes.
 */
const moduleIsolationRule: ArchitectureRule = {
  id: 'modular/module-isolation',
  description: 'Modules can only import from other modules via their public api package',
  appliesTo: '**/modules/**/*.{ts,java,cs}',
  validate(filePath: string, imports: string[]): RuleViolation[] {
    const violations: RuleViolation[] = [];
    const normPath = filePath.replace(/\\/g, '/');
    const match = normPath.match(/modules\/([^/]+)\//);
    if (!match) return violations;
    const currentModule = match[1];

    for (const imp of imports) {
      const impNorm = imp.replace(/\\/g, '/');
      const moduleMatch = impNorm.match(/modules\/([^/]+)/);
      if (moduleMatch && moduleMatch[1] !== currentModule) {
        // Cross-module import: must go through api/
        if (
          !impNorm.includes('/api/') &&
          !impNorm.includes('.api.') &&
          !impNorm.includes('/events/')
        ) {
          violations.push({
            ruleId: 'modular/module-isolation',
            file: filePath,
            message: `Module "${currentModule}" imports internal code from module "${moduleMatch[1]}". Use the public API instead.`,
            severity: 'error',
          });
        }
      }
    }
    return violations;
  },
};

// ── Rule registry ────────────────────────────────────────

const BUILT_IN_RULES: ArchitectureRule[] = [
  domainIsolationRule,
  applicationIsolationRule,
  featureIsolationRule,
  namingConventionRule,
  hexagonalPortIsolationRule,
  dddAggregateIsolationRule,
  fsdLayerOrderRule,
  cqrsSegregationRule,
  moduleIsolationRule,
];

/**
 * Get the applicable rules for a given architecture style.
 */
export function getRulesForArchitecture(
  architecture: ArchitectureStyle,
  extraRules: ArchitectureRule[] = [],
): ArchitectureRule[] {
  const rules: ArchitectureRule[] = [...extraRules];

  switch (architecture) {
    case 'clean':
      rules.push(domainIsolationRule, applicationIsolationRule, namingConventionRule);
      break;
    case 'feature-based':
      rules.push(featureIsolationRule);
      break;
    case 'layered':
      rules.push(namingConventionRule);
      break;
    case 'hexagonal':
      rules.push(hexagonalPortIsolationRule, domainIsolationRule, namingConventionRule);
      break;
    case 'ddd':
      rules.push(dddAggregateIsolationRule, domainIsolationRule, namingConventionRule);
      break;
    case 'feature-sliced':
      rules.push(fsdLayerOrderRule, featureIsolationRule);
      break;
    case 'mvc':
      rules.push(namingConventionRule);
      break;
    case 'cqrs':
      rules.push(cqrsSegregationRule, namingConventionRule);
      break;
    case 'microservices':
      rules.push(namingConventionRule);
      break;
    case 'modular-monolith':
      rules.push(moduleIsolationRule, namingConventionRule);
      break;
  }

  return rules;
}

/**
 * Extract import paths from a TypeScript / JavaScript file.
 */
export function extractTsImports(content: string): string[] {
  const imports: string[] = [];
  // Match: import ... from '...' and require('...')
  const importRegex =
    /(?:import\s+.*?\s+from\s+['"]([^'"]+)['"])|(?:require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1] || match[2]);
  }
  return imports;
}

/**
 * Extract import paths from a Java file.
 */
export function extractJavaImports(content: string): string[] {
  const imports: string[] = [];
  const regex = /import\s+([\w.]+)\s*;/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

/**
 * Extract using directives from a C# file.
 */
export function extractCSharpImports(content: string): string[] {
  const imports: string[] = [];
  const regex = /using\s+([\w.]+)\s*;/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

/**
 * Detect the import extractor based on file extension.
 */
function getImportExtractor(filePath: string): ((content: string) => string[]) | null {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.ts':
    case '.tsx':
    case '.js':
    case '.jsx':
      return extractTsImports;
    case '.java':
      return extractJavaImports;
    case '.cs':
      return extractCSharpImports;
    default:
      return null;
  }
}

/**
 * Validate an entire project directory against architecture rules.
 * Returns all violations found.
 */
export async function validateArchitecture(
  projectDir: string,
  architecture: ArchitectureStyle,
  extraRules: ArchitectureRule[] = [],
): Promise<RuleViolation[]> {
  const rules = getRulesForArchitecture(architecture, extraRules);
  const allViolations: RuleViolation[] = [];

  for (const rule of rules) {
    const pattern = rule.appliesTo;
    const files = await glob(pattern, { cwd: projectDir, absolute: true });

    for (const filePath of files) {
      const extractor = getImportExtractor(filePath);
      let imports: string[] = [];
      if (extractor) {
        const content = await fs.readFile(filePath, 'utf-8');
        imports = extractor(content);
      }
      const violations = rule.validate(filePath, imports);
      allViolations.push(...violations);
    }
  }

  return allViolations;
}

export { BUILT_IN_RULES };
