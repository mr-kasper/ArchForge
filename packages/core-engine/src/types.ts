// ─────────────────────────────────────────────────────────
// ArchForge Core Types
// ─────────────────────────────────────────────────────────

export type Stack = 'react' | 'java' | 'dotnet';

export type ArchitectureStyle =
  | 'clean'
  | 'layered'
  | 'feature-based'
  | 'hexagonal'
  | 'ddd'
  | 'feature-sliced'
  | 'mvc'
  | 'cqrs'
  | 'microservices'
  | 'modular-monolith';

export type DatabaseOption = 'postgresql' | 'mysql' | 'none';
export type AuthOption = 'jwt' | 'oauth' | 'none';
export type ToolingOption = 'docker' | 'ci' | 'tests';

export interface ProjectConfig {
  projectName: string;
  stack: Stack;
  architecture: ArchitectureStyle;
  database: DatabaseOption;
  auth: AuthOption;
  tooling: ToolingOption[];
  outputDir: string;
}

export interface TemplateFile {
  /** Relative path inside the generated project (supports EJS interpolation) */
  path: string;
  /** EJS template content */
  content: string;
}

export interface TemplateManifest {
  stack: Stack;
  architecture: ArchitectureStyle;
  files: TemplateFile[];
  /** Optional post-generation instructions shown to the user */
  postMessages?: string[];
}

export interface ArchitectureRule {
  id: string;
  description: string;
  /** Glob pattern for files this rule applies to */
  appliesTo: string;
  /** Validate a file's import statements against the rule */
  validate: (filePath: string, imports: string[]) => RuleViolation[];
}

export interface RuleViolation {
  ruleId: string;
  file: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface GenerationResult {
  success: boolean;
  filesCreated: string[];
  warnings: string[];
  errors: string[];
  postMessages: string[];
}

export interface PluginDefinition {
  name: string;
  version: string;
  description: string;
  /** Additional files to inject into the generated project */
  files: TemplateFile[];
  /** Additional architecture rules provided by this plugin */
  rules?: ArchitectureRule[];
  /** Packages to add to the generated project's dependencies */
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────
// Architecture Definition — declarative architecture config
// This abstraction is the KEY senior-level design pattern.
// Instead of hardcoding architectures, we define them as data.
// ─────────────────────────────────────────────────────────

export interface LayerDefinition {
  /** Layer name (e.g., 'domain', 'ports', 'adapters') */
  name: string;
  /** Description of the layer's responsibility */
  description: string;
  /** Directory path for this layer */
  directory: string;
}

export interface ImportConstraint {
  /** Source layer name */
  from: string;
  /** Layers that the source layer is forbidden from importing */
  forbidden: string[];
}

export interface ArchitectureDefinition {
  /** Unique architecture identifier */
  id: ArchitectureStyle;
  /** Human-readable name */
  name: string;
  /** Short description */
  description: string;
  /** Layers in dependency order (innermost first) */
  layers: LayerDefinition[];
  /** Import constraints between layers */
  importConstraints: ImportConstraint[];
  /** Default modules to generate for each layer */
  defaultModules: Record<string, string[]>;
  /** Architecture-specific rules beyond import constraints */
  rules: ArchitectureRule[];
  /** Which stacks support this architecture */
  supportedStacks: Stack[];
}
